using System;
using System.Collections.Generic;
using System.Linq;
using System.Reflection;
using System.Text;
using System.Threading.Tasks;
using Discord;
using Discord.WebSocket;
using NLog;

namespace BSNO
{
    public static class Events
    {
        public static Task ClientOnGuildScheduledEvent(SocketGuildEvent arg)
        {
            return Task.CompletedTask;
        }

        public static Task ClientOnLog(LogMessage arg)
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
            Program.Instance.Logger.Log(level, arg.ToString(null, true, false));
            return Task.CompletedTask;
        }

        public static async Task ClientOnReady()
        {
            var list = (await Program.Instance.InteractionService.AddModulesAsync(Assembly.GetExecutingAssembly(), Program.Instance.Provider)).ToArray();
            foreach (var guild in Program.Instance.Client.Guilds)
            {
                await Program.Instance.InteractionService.AddModulesToGuildAsync(guild, true, list);
            }
        }

        public static Task ClientOnInviteCreated(SocketInvite arg)
        {
            return Task.CompletedTask;
        }

        public static Task ClientOnPresenceUpdated(SocketUser arg1, SocketPresence arg2, SocketPresence arg3)
        {
            return Task.CompletedTask;
        }
    }
}
