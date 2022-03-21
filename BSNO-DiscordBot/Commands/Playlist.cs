using Discord.Interactions;
using Microsoft.Extensions.Logging;

namespace BSNO.Commands
{
    [Group("playlist", "All the commands for playlists")]
    public class Playlist : InteractionModuleBase
    {
        private readonly ILogger _logger;

        public Playlist(ILogger<Playlist> logger)
        {
            _logger = logger;
        }

        [SlashCommand("list", "Lists all available playlists.")]
        public async Task Playlists()
        {
            _logger.LogTrace("List playlists triggered");
            await RespondAsync("There is no playlists available at the moment.");
        }
    }
}
