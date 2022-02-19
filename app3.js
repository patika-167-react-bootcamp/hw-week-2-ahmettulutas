import {svgFiles} from "./svg.js";
let form = document.querySelector('form');
let users = [];
let alerts = [];
let senders = document.getElementById("sender");
let receivers = document.getElementById("receiver");
let tableBody = document.querySelector("#accountlistul");
let transactionDiv = document.querySelector("#transaction-log");
document.getElementsByClassName("delete-btn").click =  () => {removeUser()};
let searchTerm= "";
let filterRule = "name";

document.querySelector("#userForm").onsubmit = (e) => {   
    console.log(filterRule);
    e.preventDefault();
    let nameInput = document.querySelector("#accountName");
    let balanceInput = document.querySelector("#accountBalance");
        if(balanceInput.value > 0 ){
        // first we must check if the user already exists by using filter function.
        if(users.filter(item => item.name === nameInput.value).length === 0){
            users.push({name: nameInput.value, balance: Number(balanceInput.value)});
            alerts.push({type:"addUser", accountOwner:nameInput.value, status:"success",message:`${nameInput.value} has been added to the list`})   
        }
        else {
            alerts.push({type:"addUser",status:"fail",message:`user ${nameInput.value} already exists`})
        }                           
    }
    else {
        alert("Please enter a valid balance")

    }
    setUserTable(users, tableBody);
    setOptions(users, senders, receivers);  
    setTransactionLog();
    form.reset();
    nameInput.focus();
} 
// end of userForm onsubmit event.
document.querySelector("#transactionForm").onsubmit = (e) => {
    e.preventDefault();
    let sender = document.getElementById("sender").value;
    let receiver = document.getElementById("receiver").value;
    let amount = Number(document.getElementById("amount").value);
    let senderIndex = users.findIndex(item => item.name === sender);
    let receiverIndex = users.findIndex(item => item.name === receiver);
    const resetForm = () => {
        document.getElementById("sender").selectedIndex = 0;
        document.getElementById("receiver").selectedIndex = 0;
        document.getElementById("amount").value = "";
    }
    if(sender === receiver){ // check if the sender and receiver are the same
        alerts.push({type:"makeTransaction", status:"fail", message:"You cannot send money to yourself"});
    }
    else if(amount > 0 ){ // check if the amount is valid;
        if(users[senderIndex].balance >= amount){ // check if the sender has enough money
                users[senderIndex].balance -= amount;
                users[receiverIndex].balance += amount;
                alerts.push({type:"makeTransaction", status:"success", sender:sender,receiver:receiver,amount:amount, message:`${amount}$ has been sent from ${sender} to ${receiver}`,button:true}); 
            }
        else { // if the sender's balance is less than the amount to be sent
                alerts.push({status:"fail", message:`${sender} does not have enough balance to send ${amount}$`});
            }
            }
    else { // if any of the fields are empty
        alerts.push({status:"fail", message:"Please enter a name and/or balance"});
        }
    setTransactionLog();
    setUserTable(users, tableBody);
    resetForm(); 
        }  
// end of transactionForm onsubmit event


const removeUser = (e) => {
    e.preventDefault();
    users = users.filter(item => item.name !== e.target.value);
    setUserTable(users, tableBody);
    setOptions(users, senders, receivers);
}
const setUserTable = (arr, table) => {
    table.innerHTML = "";
    return arr.forEach((item) => {
        let li = document.createElement("li");
        li.setAttribute("class", "list-item");
        let name = document.createElement("p");
        name.innerHTML = `Name:<span>${item.name}</span>`;
        let balance = document.createElement("p");
        balance.innerHTML = `Balance:<span>${item.balance}$</span>`;     
        let button = document.createElement("button");
        button.value = item.name;
        button.setAttribute("class", "remove-button");
        button.innerHTML = "remove";
        button.onclick = removeUser;
        li.appendChild(name);
        li.appendChild(balance);
        li.appendChild(button);
        table.appendChild(li);      
    })
}
const setOptions = (arr, senders, receivers) => {
    // we need to define default options for the select options.
    let defaultSenderOpt = document.createElement("option");
    defaultSenderOpt.value = "";
    defaultSenderOpt.text = "From";
    let defaultReceiverOpt = document.createElement("option");
    defaultReceiverOpt.value = "";
    defaultReceiverOpt.text = "To";
    // Then we reset the options of the select options to the default.
    senders.textContent = "";
    receivers.textContent = "";
    senders.appendChild(defaultSenderOpt);
    receivers.appendChild(defaultReceiverOpt);
    // By using forEach we can iterate through the users array and add the options to the select options.
    arr.forEach((user) => {
        let opt = document.createElement("option");
        opt.value = user.name;
        opt.innerText = user.name;   
        senders.appendChild(opt);   
        receivers.appendChild(opt.cloneNode(true));
        })
}
const undoTransaction = (e) => { 
    e.preventDefault();
    const dataObject = alerts[e.target.value];
    if(users.filter(item => item.name === dataObject.sender).length === 0) {
        alerts.push({status:"fail",message:`${dataObject.sender} has been removed from the bank`});
    }
    else {
        users.map(item => {
            if(item.name === dataObject.sender){
                item.balance += dataObject.amount;
            }
            if(item.name === dataObject.receiver){
                item.balance -= dataObject.amount;
            }
        });
        // changes button to false so that the user can undo the transaction only once.
        alerts = alerts.map(item => item === dataObject ? {...item, button: !item.button} : item); // remove the transaction from the alerts array

    }
    setUserTable(users, tableBody);
    setTransactionLog();
}
const setTransactionLog = () => {
    transactionDiv.innerText = ""; 
    filterTransaction(alerts).forEach((item,index) => {
        let button = document.createElement("button");
        button.setAttribute("class", "remove-button");
        let li = document.createElement("li");
        li.setAttribute("class", "list-item");
        let message = document.createElement("p");  
        message.innerHTML = item.message;
        // disables the button if the user clicks undo once.
        if(!item.button) {
            button.setAttribute("disabled", true);
        }
        button.innerText = "Undo";
        button.value = index;
        button.onclick = undoTransaction;
        let icon  = item.status === "success" ? svgFiles.success : svgFiles.fail;
        
        if(item.status === "success") {
            // adds undo button if transaction type is makeTransaction;
            if (item.type === "makeTransaction") {
                li.innerHTML += icon;
                li.appendChild(message);
                li.appendChild(button);
                transactionDiv.appendChild(li);
            }
            else {   
                li.innerHTML += icon;
                li.appendChild(message);
                transactionDiv.appendChild(li);
            }
        }
        if (item.status === "fail") {
            li.innerHTML += icon;
            li.appendChild(message);
            transactionDiv.appendChild(li);
        }
})
}
// Below code is used to filter the alerts array to only show the transactions that are relevant to the user.
document.getElementById("search-input").addEventListener("input", e => {
    searchTerm = e.target.value;
    setTransactionLog();
})
document.getElementById("filter-select").addEventListener("change", e => {
    filterRule = e.target.value;
    setTransactionLog();
})
document.getElementById("clear-button").onclick = () => {
    document.getElementById("search-input").value = "";
    searchTerm = "";
    setTransactionLog();
}
const filterTransaction = (arr) => {
    // sets the searchTerm to the value of the search input
    searchTerm = document.getElementById("search-input").value;
    // if the searchTerm is empty, we return the whole array.
    if(searchTerm === "") {
        return arr;
    }
    if(filterRule === "name" && searchTerm != "") {
        // If so filterRule is name, filters the alerts array that is makeTransaction type and has the name of the user in either as receiver or as sender.
        const transactionLogFilter = arr.filter(item => item.sender && item.sender.toLowerCase().includes(searchTerm.toLowerCase()) || item.receiver && item.receiver.toLowerCase().includes(searchTerm.toLowerCase()));
        return transactionLogFilter;
    }
    else {
        // filters the alert objects that has filterRule paremeter (it can be sender or receiver) and has searchTerm letters.
        const transactionLogFilter = arr.filter(item => item[filterRule] && item[filterRule].toLowerCase().includes(searchTerm.toLowerCase()));
        return transactionLogFilter;
    }
}   

