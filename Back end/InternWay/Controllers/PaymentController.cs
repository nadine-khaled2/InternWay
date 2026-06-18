using InternWay.Models.PaymentSystem;
using InternWay.Services.PaymentServices;
using InternWay.Services.StudentServices;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SendGrid.Helpers.Mail;
using System.Security.Claims;
using System.Text.Json;
using static InternWay.Models.mentor_schema.Mentorship_Session;
using static System.Runtime.InteropServices.JavaScript.JSType;

namespace InternWay.Controllers
{
    [Route("[controller]")]
    [ApiController]

    public class PaymentController : ControllerBase
    {
        private readonly InternShipWayDB InternShipWayDB;
        private readonly PaymentSystem paymentSystem;

        public PaymentController(InternShipWayDB _internShipWayDB , PaymentSystem paymentSystem)
        {
            this.InternShipWayDB = _internShipWayDB;
            this.paymentSystem = paymentSystem;
        }
      
        [HttpPost("pay/session/{sessionId}")]
        public async Task<IActionResult> PaySession(int sessionId)
        {
            var UserId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
           
            if (UserId == null)
                return Unauthorized("Unauthorized access");

            if (!int.TryParse(UserId, out var id))
                return Unauthorized("Unauthorized access");
           
            var response =  await paymentSystem.PaySession(sessionId,id);

           return Ok(response);
        }

        [HttpPost("webhook")]
        public async Task<IActionResult> PaymobWebhook([FromBody] JsonElement data)
        {
            using var transaction = await InternShipWayDB.Database.BeginTransactionAsync();

            try
            {
               
                if (data.TryGetProperty("type", out var typeEl))
                {
                    var type = typeEl.GetString();
                    Console.WriteLine($"Webhook type: {type}");
                    if (type != "TRANSACTION")
                        return Ok();
                }

                if (!data.TryGetProperty("obj", out var obj))
                {
                    Console.WriteLine("No 'obj' found in webhook");
                    return Ok();
                }

                
                bool success = false;
                if (obj.TryGetProperty("success", out var successProp))
                {
                    if (successProp.ValueKind == JsonValueKind.True)
                        success = true;
                    else if (successProp.ValueKind == JsonValueKind.String)
                        bool.TryParse(successProp.GetString(), out success);
                }
                Console.WriteLine($"Payment success: {success}");

                
                long transactionId = 0;
                if (obj.TryGetProperty("id", out var idProp))
                {
                    if (idProp.ValueKind == JsonValueKind.Number)
                        transactionId = idProp.GetInt64();
                    else if (idProp.ValueKind == JsonValueKind.String)
                        long.TryParse(idProp.GetString(), out transactionId);
                }
                Console.WriteLine($"Transaction ID: {transactionId}");

                if (transactionId == 0)
                {
                    Console.WriteLine("Transaction ID is 0, skipping");
                    return Ok();
                }

                if (!obj.TryGetProperty("order", out var order))
                {
                    Console.WriteLine("No 'order' found in obj");
                    return Ok();
                }

               
                string merchantOrderIdStr = "";
                if (order.TryGetProperty("merchant_order_id", out var merchantOrderProp))
                {
                    if (merchantOrderProp.ValueKind == JsonValueKind.String)
                        merchantOrderIdStr = merchantOrderProp.GetString() ?? "";
                    else if (merchantOrderProp.ValueKind == JsonValueKind.Number)
                        merchantOrderIdStr = merchantOrderProp.GetInt32().ToString();
                }
                Console.WriteLine($"Merchant Order ID: {merchantOrderIdStr}");

                if (!int.TryParse(merchantOrderIdStr, out int sessionId))
                {
                    Console.WriteLine($"Invalid sessionId: {merchantOrderIdStr}");
                    return Ok();
                }

               
                var exists = await InternShipWayDB.Transactions
                    .AnyAsync(x => x.TransactionId == transactionId);

                if (exists)
                {
                    Console.WriteLine($"Transaction {transactionId} already processed");
                    return Ok();
                }

              
                var session = await InternShipWayDB.mentorship_Sessions
                    .Include(x => x.mentor_availability)
                    .FirstOrDefaultAsync(x => x.session_id == sessionId);

                if (session == null)
                {
                    Console.WriteLine($"Session {sessionId} not found");
                    return Ok();
                }

                var payment = await InternShipWayDB.Payments
                    .Where(e => e.SessionId == session.session_id)
                    .OrderByDescending(e=>e.Id)
                    .FirstOrDefaultAsync();
               
                if (payment == null)
                {
                    Console.WriteLine($"payment of this session {sessionId} not found");
                    return Ok();
                }

                if (!success)
                {
                    Console.WriteLine("Payment failed, setting session to Pending");
                    session.status_session = Status_Session.Pending;
                    payment.Status = PaymentStatus.Failed;
                    await InternShipWayDB.SaveChangesAsync();
                    await transaction.CommitAsync();
                    return Ok();
                }

              
                if (session.status_session == Status_Session.Confirmed)
                {
                    Console.WriteLine("Session already confirmed");
                    return Ok();
                }

               
                session.status_session = Status_Session.Confirmed;
                payment.Status = PaymentStatus.Paid;
                payment.TransactionId = transactionId.ToString();

                decimal amount = session.mentor_availability.priceSlot;
                decimal mentorAmount = amount * 0.70m;

                var mentorWallet = await InternShipWayDB.mentorWallets
                    .FirstOrDefaultAsync(x => x.MentorId == session.mentor_availability.mentor_id);

                if (mentorWallet == null)
                {
                    mentorWallet = new MentorWallet
                    {
                        MentorId = session.mentor_availability.mentor_id,
                        CurrentBalance = 0,
                        PendingBalance = 0
                    };
                    InternShipWayDB.mentorWallets.Add(mentorWallet);
                    await InternShipWayDB.SaveChangesAsync();
                }

                mentorWallet.PendingBalance += mentorAmount;

                InternShipWayDB.Transactions.Add(new Transaction
                {
                    WalletId = mentorWallet.Id,
                    TransactionId = transactionId,
                    Amount = mentorAmount,
                    Type = TransactionType.MentorEarning,
                    SessionId = sessionId
                });

                await InternShipWayDB.SaveChangesAsync();
                await transaction.CommitAsync();

                Console.WriteLine($"Session {sessionId} confirmed successfully!");
                return Ok();
            }
            catch (Exception )
            {
                await transaction.RollbackAsync();
                return BadRequest();
            }
        }

        [HttpPost("/wallets/compensate-mentor/{sessionId}")]
        public async Task<IActionResult> compensationMentor(int sessionId)
        {
            var UserId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
          
            if (UserId == null)
                return Unauthorized("Unauthorized access");

            if (!int.TryParse(UserId, out var id))
                return Unauthorized("Unauthorized access");
           
            var result = await paymentSystem.ApplyCancellationPenaltyAsync(sessionId, id);
            return result.statusCode switch
            {
                401 => Unauthorized(result.Item2),
                403 => StatusCode(403 , result.Item2),
                400 => BadRequest(result.Item2),
                200 => Ok(result.Item2),
                500 => StatusCode(StatusCodes.Status500InternalServerError,
                       new { errorMessage = result.Item2 }),
                _ => StatusCode(StatusCodes.Status500InternalServerError,
                      new { errorMessage = result.Item2 })
            };
        }



    }
}
