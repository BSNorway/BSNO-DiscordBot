using System.Reflection;
using Discord;
using Discord.Interactions;
using Discord.Net;
using Discord.WebSocket;
using Microsoft.Extensions.DependencyInjection;
using Newtonsoft.Json;
using NLog;

namespace BSNO
{
    public class Program
    {
        public static Logger Logger = null!;
        public static DiscordSocketClient Client = null!;
        public static IServiceProvider Provider = null!;
        private InteractionService _interactionService = null!;

        public Program()
        {
            DotEnv.Load();
            Provider = new ServiceCollection()
                .AddLogging()
                .BuildServiceProvider();
        }

        public static void Main(string[] args)
        {
            new Program().MainAsync().GetAwaiter().GetResult();
        }

        private async Task MainAsync()
        {
            Logger = LogManager.GetCurrentClassLogger();

            Client = new DiscordSocketClient(new DiscordSocketConfig
            {
                GatewayIntents = GatewayIntents.All,
                AlwaysDownloadUsers = true
            });
            _interactionService = new InteractionService(Client);
            Client.Log += ClientOnLog;
            Client.SlashCommandExecuted += ClientOnSlashCommandExecuted;
            Client.Ready += ClientOnReady;
            Client.PresenceUpdated += ClientOnPresenceUpdated;
            Client.InviteCreated += ClientOnInviteCreated;
            Client.GuildScheduledEventStarted += ClientOnGuildScheduledEvent;
            Client.GuildScheduledEventCreated += ClientOnGuildScheduledEvent;
            Client.GuildScheduledEventCompleted += ClientOnGuildScheduledEvent;
            Client.GuildScheduledEventCancelled += ClientOnGuildScheduledEvent;
            await Client.LoginAsync(TokenType.Bot, Environment.GetEnvironmentVariable("BOT_KEY"));
            await Client.StartAsync();
            while (Console.ReadKey().Key != ConsoleKey.Q)
            {
                Console.WriteLine("Press q to exit program");
            }
            await Client.StopAsync();
            while (Client.ConnectionState != ConnectionState.Disconnected)
            {
                Task.Delay(10).GetAwaiter().GetResult();
            }
        }

        private Task ClientOnGuildScheduledEvent(SocketGuildEvent arg)
        {
            return Task.CompletedTask;
        }

        private async Task ClientOnSlashCommandExecuted(SocketSlashCommand arg)
        {
            var ctx = new SocketInteractionContext<SocketSlashCommand>(Client, arg);
            await _interactionService.ExecuteCommandAsync(ctx, Provider);
        }

        private Task ClientOnLog(LogMessage arg)
        {
            var level = arg.Severity switch
            {
                LogSeverity.Debug => LogLevel.Debug,
                LogSeverity.Critical => LogLevel.Fatal,
                LogSeverity.Error => LogLevel.Error,
                LogSeverity.Warning => LogLevel.Warn,
                LogSeverity.Info => LogLevel.Info,
                LogSeverity.Verbose => LogLevel.Trace,
                _ => throw new ArgumentOutOfRangeException()
            };
            Logger.Log(level, arg.ToString(null, true, false));
            return Task.CompletedTask;
        }

        private async Task ClientOnReady()
        {
            var list = (await _interactionService.AddModulesAsync(Assembly.GetExecutingAssembly(), Provider)).ToArray();
            foreach (var guild in Client.Guilds)
            {
                await _interactionService.AddModulesToGuildAsync(guild, true, list);
            }
        }

        private Task ClientOnInviteCreated(SocketInvite arg)
        {
            return Task.CompletedTask;
        }

        private Task ClientOnPresenceUpdated(SocketUser arg1, SocketPresence arg2, SocketPresence arg3)
        {
            return Task.CompletedTask;
        }
    }
}