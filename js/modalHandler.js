const Modal = {
    element: document.getElementById('modal-overlay'),
    content: {
        "Settings": {
            '<i class="bi bi-stars"></i> Dark Theme': {
                id: "theme",
                type: "switch",
                value: true,
            }
        }
    },

    settings: function () {
        const header = this.element.querySelector('.header');
        header.textContent = 'SETTINGS';

        const body = this.element.querySelector('.body');
        body.innerHTML = '';

        for (const sectionName in this.content["Settings"]) {
            const setting = this.content["Settings"][sectionName];

            const sectionDiv = document.createElement('div');
            sectionDiv.className = 'section no-select';

            const label = document.createElement('label');
            label.setAttribute('for', setting.id);
            label.innerHTML = sectionName;
            sectionDiv.appendChild(label);

            if (setting.type === "switch") {
                const switchWrapper = document.createElement('div');
                switchWrapper.className = 'switch-wrapper';

                const switchLabel = document.createElement('label');
                switchLabel.className = 'switch';

                const input = document.createElement('input');
                input.type = 'checkbox';
                input.id = setting.id;
                input.checked = setting.value;

                const slider = document.createElement('span');
                slider.className = 'slider';

                switchLabel.appendChild(input);
                switchLabel.appendChild(slider);
                switchWrapper.appendChild(switchLabel);
                sectionDiv.appendChild(switchWrapper);
            }

            body.appendChild(sectionDiv);
        }

        this.open();
    },

    info: function () {
        const header = this.element.querySelector('.header');
        header.textContent = 'PixelResizer';

        const body = this.element.querySelector('.body');
        body.innerHTML = `
            <div class="section text">
                <span>Last Update</span>
                <span id="last-update">${this.updateInfo ? this.updateInfo.lastUpdate : 'Fetching...'}</span>
            </div>
            <div class="section text">
                <span>Build ID</span>
                <span id="build-id">${this.updateInfo ? `<a href="https://github.com/Modraxiss/PixelResizer/commit/${this.updateInfo.buildId}" target="_blank">${this.updateInfo.buildId}</a>` : 'Fetching...'}</span>
            </div>
            <div class="divider"></div>
            <div class="section text">PixelResizer is an open-source, lightweight, and easy-to-use image resizer tool. It's designed to help you resize images quickly and easily, without needing to manually edit file dimensions.</div>

            <div class="section text">Feel free to contribute by submitting issues or pull requests <a href="https://github.com/Modraxiss/PixelResizer" target="_blank">here</a>. For inquiries, contact Modraxis on <a href="https://discord.gg/5KzPdSYNqx" target="_blank">Discord</a>.</div>
            
            <div class="section text">Disclaimer: This tool is not intended for professional image editing. It's recommended to use professional tools for image editing and optimization.</div>
        `;

        this.open();
    },

    updateInfo: null,

    fetchLatestCommitInfo: function () {
        if (this.updateInfo) return;

        fetch('https://api.github.com/repos/Modraxiss/PixelResizer/commits/main')
            .then(response => response.json())
            .then(data => {
                const commitDate = new Date(data.commit.committer.date);
                const lastUpdate = this.formatRelativeDate(commitDate);
                const buildId = data.sha.substring(0, 7);

                this.updateInfo = { lastUpdate, buildId };

                const lastUpdateElem = document.getElementById('last-update');
                const buildIdElem = document.getElementById('build-id');

                if (lastUpdateElem && buildIdElem) {
                    lastUpdateElem.textContent = this.updateInfo.lastUpdate;
                    buildIdElem.textContent = this.updateInfo.buildId;
                }
            })
            .catch(error => {
                console.error('Error fetching commit data:', error);
                this.updateInfo = { lastUpdate: 'Unavailable', buildId: 'Unavailable' };
            });
    },

    formatRelativeDate: function (date) {
        const today = new Date();
        const diffTime = today - date;
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays === 0) return "Today";
        if (diffDays === 1) return "1 Day ago";
        return `${diffDays} Days ago`;
    },

    open: function () {
        this.element.setAttribute("open", true);
    },

    close: function () {
        this.element.removeAttribute("open");
    }
};

Modal.fetchLatestCommitInfo();

// Event Listeners
document.getElementById('settings').addEventListener('click', function () {
    Modal.settings();
});

document.querySelectorAll('#info').forEach(element => {
    element.addEventListener('click', function () {
        Modal.info();
    });
});

document.getElementById('close').addEventListener('click', function () {
    Modal.close();
});
