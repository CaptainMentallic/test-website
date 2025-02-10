// console commands


window.commands = {
    async getVersion() {
        var version = await fetch('version.txt')
            .then(response => response.text())
            .catch(error => console.error('Error fetching version file:', error));

        var url = `https://api.github.com/repos/CaptainMentallic/test-website/commits/main`;
        try {
            var response = await fetch(url);
            if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);

            var data = await response.json();

            // convert date to time ago string (ex. 4 hours, 26 minutes and 3 seconds ago)
            var commitDate = new Date(data.commit.author.date);
            var now = new Date();
            var diffInSeconds = Math.floor((now - commitDate) / 1000);

            var timeUnits = [
                { label: "day", value: Math.floor(diffInSeconds / (3600 * 24)) },
                { label: "hour", value: Math.floor((diffInSeconds % (3600 * 24)) / 3600) },
                { label: "minute", value: Math.floor((diffInSeconds % 3600) / 60) },
                { label: "second", value: diffInSeconds % 60 }
            ];
            var result = timeUnits
                .filter(unit => unit.value > 0)
                .map(unit => `${unit.value} ${unit.label}${unit.value !== 1 ? 's' : ''}`)
                .join(" and ");

            var timeAgo = result ? `${result} ago` : "Just now";

        } catch (error) {
            console.error("Error fetching latest commit:", error);
        }

        return console.log(`Current version: ${version}\nLatest commit: ${data.sha}\nReleased: ${timeAgo}`);
    }
}