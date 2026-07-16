var builder = WebApplication.CreateBuilder(args);
builder.Services.AddControllers();
builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(policy =>
    {
        policy.AllowAnyOrigin().AllowAnyMethod().AllowAnyHeader();
    });
});

var app = builder.Build();
app.UseDefaultFiles();          // 自动提供 index.html 作为默认页
app.UseStaticFiles();           // 提供 wwwroot 下的静态文件
app.UseCors();
app.MapControllers();
app.Run();
