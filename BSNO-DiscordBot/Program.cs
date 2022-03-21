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
        public static Program Instance = null!;
        public readonly Logger Logger;
        public readonly DiscordSocketClient Client = new (new DiscordSocketConfig
        {
            GatewayIntents = GatewayIntents.All,
            AlwaysDownloadUsers = true
        });
        public readonly IServiceProvider Provider;
        public readonly InteractionService InteractionService;

        public Program()
        {
            Instance = this;
            DotEnv.Load();
            Logger = LogManager.GetCurrentClassLogger();
            Provider = Configure(new ServiceCollection());
            InteractionService = new InteractionService(Client);
        }

        public static void Main(string[] args)
        {
            new Program().MainAsync().GetAwaiter().GetResult();
        }

        public IServiceProvider Configure(ServiceCollection collection)
        {
            collection.AddLogging();

            return collection.BuildServiceProvider();
        }

        private async Task MainAsync()
        {
            #region Discord Events assign
            Client.Log += Events.ClientOnLog;
            Client.SlashCommandExecuted += async command => 
                await InteractionService.ExecuteCommandAsync(new SocketInteractionContext<SocketSlashCommand>(Client, command), Provider);
            Client.Ready += Events.ClientOnReady;
            Client.PresenceUpdated += Events.ClientOnPresenceUpdated;
            Client.InviteCreated += Events.ClientOnInviteCreated;
            Client.GuildScheduledEventStarted += Events.ClientOnGuildScheduledEvent;
            Client.GuildScheduledEventCreated += Events.ClientOnGuildScheduledEvent;
            Client.GuildScheduledEventCompleted += Events.ClientOnGuildScheduledEvent;
            Client.GuildScheduledEventCancelled += Events.ClientOnGuildScheduledEvent;
            #endregion

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
    }
}