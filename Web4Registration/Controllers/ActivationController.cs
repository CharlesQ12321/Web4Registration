using Microsoft.AspNetCore.Mvc;
using RegistrationManager;

namespace Web4Registration.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ActivationController : ControllerBase
{
    [HttpPost("generate")]
    public IActionResult GenerateActivationCode([FromBody] UserCodeRequest request)
    {
        try
        {
            if (string.IsNullOrWhiteSpace(request.UserCode))
            {
                return BadRequest(new { success = false, message = "用户码不能为空" });
            }

            string activationCode = ValidityManager.GenerateVipCode(request.UserCode);

            if (string.IsNullOrEmpty(activationCode))
            {
                return BadRequest(new { success = false, message = "用户码无效，请检查后重新输入" });
            }

            return Ok(new { success = true, activationCode });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { success = false, message = $"服务器异常: {ex.Message}" });
        }
    }
}

public class UserCodeRequest
{
    public string UserCode { get; set; } = "";
}
