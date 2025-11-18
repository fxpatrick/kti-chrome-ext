console.log("TEST: test-console.js loaded successfully!");

document.getElementById('testBtn')?.addEventListener('click', () => {
    console.log("TEST: Button clicked!");
    alert("Button clicked! Check console.");
});

console.log("TEST: Script initialization complete");
