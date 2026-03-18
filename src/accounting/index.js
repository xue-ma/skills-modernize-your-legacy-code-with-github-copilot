const readline = require("node:readline/promises");
const { stdin, stdout } = require("node:process");

const MENU_LINES = [
  "--------------------------------",
  "Account Management System",
  "1. View Balance",
  "2. Credit Account",
  "3. Debit Account",
  "4. Exit",
  "--------------------------------",
];

function formatAmount(amount) {
  return amount.toFixed(2);
}

function createAccountingApp(initialBalance = 1000.0) {
  // In-memory data layer equivalent to DataProgram.
  const dataStore = {
    storageBalance: initialBalance,
  };

  function dataProgram(operation, balance = 0) {
    if (operation === "READ") {
      return dataStore.storageBalance;
    }

    if (operation === "WRITE") {
      dataStore.storageBalance = balance;
      return dataStore.storageBalance;
    }

    return dataStore.storageBalance;
  }

  function operations(passedOperation, amount = 0) {
    const operationType = passedOperation;
    let finalBalance = 1000.0;

    if (operationType === "TOTAL ") {
      finalBalance = dataProgram("READ", finalBalance);
      return `Current balance: ${formatAmount(finalBalance)}`;
    }

    if (operationType === "CREDIT") {
      finalBalance = dataProgram("READ", finalBalance);
      finalBalance += amount;
      dataProgram("WRITE", finalBalance);
      return `Amount credited. New balance: ${formatAmount(finalBalance)}`;
    }

    if (operationType === "DEBIT ") {
      finalBalance = dataProgram("READ", finalBalance);

      if (finalBalance >= amount) {
        finalBalance -= amount;
        dataProgram("WRITE", finalBalance);
        return `Amount debited. New balance: ${formatAmount(finalBalance)}`;
      }

      return "Insufficient funds for this debit.";
    }

    return "";
  }

  function handleMenuChoice(userChoice, amount = 0) {
    if (userChoice === "1") {
      return { continueFlag: "YES", output: operations("TOTAL ", 0) };
    }

    if (userChoice === "2") {
      return { continueFlag: "YES", output: operations("CREDIT", amount) };
    }

    if (userChoice === "3") {
      return { continueFlag: "YES", output: operations("DEBIT ", amount) };
    }

    if (userChoice === "4") {
      return { continueFlag: "NO", output: "" };
    }

    return {
      continueFlag: "YES",
      output: "Invalid choice, please select 1-4.",
    };
  }

  function getBalance() {
    return dataProgram("READ", 0);
  }

  return {
    dataProgram,
    operations,
    handleMenuChoice,
    getBalance,
  };
}

async function readAmount(rl, promptText) {
  const raw = await rl.question(promptText);
  const parsed = Number.parseFloat(raw);

  if (Number.isNaN(parsed)) {
    return 0;
  }

  return parsed;
}

function showMenu() {
  MENU_LINES.forEach((line) => console.log(line));
}

// Entry point equivalent to MainProgram.
async function main() {
  const app = createAccountingApp();
  const rl = readline.createInterface({
    input: stdin,
    output: stdout,
  });

  let continueFlag = "YES";

  while (continueFlag !== "NO") {
    showMenu();
    const userChoice = await rl.question("Enter your choice (1-4): ");
    let amount = 0;

    if (userChoice === "2") {
      amount = await readAmount(rl, "Enter credit amount: ");
    } else if (userChoice === "3") {
      amount = await readAmount(rl, "Enter debit amount: ");
    }

    const result = app.handleMenuChoice(userChoice, amount);
    continueFlag = result.continueFlag;

    if (result.output) {
      console.log(result.output);
    }
  }

  console.log("Exiting the program. Goodbye!");
  rl.close();
}

module.exports = {
  MENU_LINES,
  formatAmount,
  createAccountingApp,
};

if (require.main === module) {
  main();
}
