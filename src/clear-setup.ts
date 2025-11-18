document.getElementById('clearBtn')?.addEventListener('click', async () => {
    await chrome.storage.local.remove(['companyName', 'companySetupCompleted']);
    const statusEl = document.getElementById('status');
    if (statusEl) {
        statusEl.textContent = 'Setup data cleared! Close this tab and reopen the extension.';
    }
});
