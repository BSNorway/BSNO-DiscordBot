using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BSNO
{
    internal class DotEnv
    {
        public static void Load()
        {
            var path = Path.Join(Directory.GetCurrentDirectory(), ".env");
            if (!File.Exists(path))
                return;

            foreach (var line in File.ReadAllLines(path))
            {
                var parts = line.Split('=', StringSplitOptions.RemoveEmptyEntries);
                if(parts.Length != 2)
                    continue;
                Environment.SetEnvironmentVariable(parts[0], parts[1]);
            }

        }
    }
}
