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

            var commitDate = new Date(data.commit.author.date);
            var now = new Date();
            var diffInSeconds = Math.floor((now - commitDate) / 1000);

            var days = Math.floor(diffInSeconds / (3600 * 24));
            diffInSeconds %= 3600 * 24;

            var hours = Math.floor(diffInSeconds / 3600);
            diffInSeconds %= 3600;

            var minutes = Math.floor(diffInSeconds / 60);
            var seconds = diffInSeconds % 60;

            var timeAgo = `${days} day${days !== 1 ? 's' : ''}, ` +
                `${hours} hour${hours !== 1 ? 's' : ''}, ` +
                `${minutes} minute${minutes !== 1 ? 's' : ''}, ` +
                `and ${seconds} second${seconds !== 1 ? 's' : ''} ago`;

        } catch (error) {
            console.error("Error fetching latest commit:", error);
        }

        console.log("Current version: " + version)
        console.log("Released: " + timeAgo);
    }
}