let db;
//Creates a new db request for the "budget" database

const request = indexedDB.open("budget", 1);

request.onupgradeneeded = event => {
    // created pending object store
    const db = event.target.result;
    const pendingStore = db.createObjectStore("pending", {autoIncrement: true});
    pendingStore.createIndex("statusIndex", "status");
}

request.onsuccess = event => {
    db.target.result;

    if(navigator.online) {
        checkDatabase();
    }
};

request.onerror = event => {
    //if error, log here
    console.log(request.error);
};

function saveRecord(record) {
    db = request.result;

    const transaction = db.transaction(["pending", "readwrite"]);
    const store = transaction.objectStore("pending");

    store.add(record);
}

function checkDatabase() {
    db = request.result;
    //opens a transaction for the pending dataBase
    const checkTransaction = db.transaction(["pending"], "readwrite");
    const checking = checkTransaction.objectStore("pending");

    const getAll = checking.getAll();
    getAll.onsuccess = function() {
        if (getAll.result.length > 0) {
            fetch("/api/transaction/bulk", {
                method: "POST",
                body: JSON.stringify(getAll.result),
                headers: {
                    Accept: "application/json, text/plain, */*", "Content-Type": "appliction/json"
                }
            })
            .then(response => response.json())
            .then(() => {

                // opens transaction on pending database if successful
                const workTransaction = db.transaction(["pending"], "readWrite");
                // allows access to pending object store
                const success = workTransaction.objectStore("pending");
                //clears all of the items in store
                success.clear();
            })
        }
    }
}

window.addEventListener("online", checkDatabase);