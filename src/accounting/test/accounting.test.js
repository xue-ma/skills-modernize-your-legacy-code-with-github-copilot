const { MENU_LINES, createAccountingApp } = require("../index");

describe("COBOL parity test plan scenarios", () => {
  test("TC-001: application menu rendering", () => {
    expect(MENU_LINES).toEqual([
      "--------------------------------",
      "Account Management System",
      "1. View Balance",
      "2. Credit Account",
      "3. Debit Account",
      "4. Exit",
      "--------------------------------",
    ]);
  });

  test("TC-002: exit option ends loop", () => {
    const app = createAccountingApp();
    const result = app.handleMenuChoice("4");

    expect(result.continueFlag).toBe("NO");
    expect(result.output).toBe("");
  });

  test("TC-003: invalid menu choice handling", () => {
    const app = createAccountingApp();
    const result = app.handleMenuChoice("9");

    expect(result.continueFlag).toBe("YES");
    expect(result.output).toBe("Invalid choice, please select 1-4.");
  });

  test("TC-004: initial balance is 1000.00 via view balance", () => {
    const app = createAccountingApp();
    const result = app.handleMenuChoice("1");

    expect(result.output).toBe("Current balance: 1000.00");
  });

  test("TC-005: credit increases balance and persists", () => {
    const app = createAccountingApp();

    const credit = app.handleMenuChoice("2", 250.0);
    const total = app.handleMenuChoice("1");

    expect(credit.output).toBe("Amount credited. New balance: 1250.00");
    expect(total.output).toBe("Current balance: 1250.00");
  });

  test("TC-006: debit decreases balance when sufficient", () => {
    const app = createAccountingApp();

    app.handleMenuChoice("2", 200.0);
    const debit = app.handleMenuChoice("3", 200.0);
    const total = app.handleMenuChoice("1");

    expect(debit.output).toBe("Amount debited. New balance: 1000.00");
    expect(total.output).toBe("Current balance: 1000.00");
  });

  test("TC-007: insufficient funds blocks debit and preserves balance", () => {
    const app = createAccountingApp();

    app.handleMenuChoice("3", 1100.0);
    const total = app.handleMenuChoice("1");

    expect(app.handleMenuChoice("3", 1100.0).output).toBe(
      "Insufficient funds for this debit."
    );
    expect(total.output).toBe("Current balance: 1000.00");
  });

  test("TC-008: debit equal to current balance is allowed", () => {
    const app = createAccountingApp();

    const debit = app.handleMenuChoice("3", 1000.0);
    const total = app.handleMenuChoice("1");

    expect(debit.output).toBe("Amount debited. New balance: 0.00");
    expect(total.output).toBe("Current balance: 0.00");
  });

  test("TC-009: cumulative credits across multiple operations", () => {
    const app = createAccountingApp();

    app.handleMenuChoice("2", 100.0);
    app.handleMenuChoice("2", 50.0);
    const total = app.handleMenuChoice("1");

    expect(total.output).toBe("Current balance: 1150.00");
  });

  test("TC-010: mixed transaction sequence final calculation", () => {
    const app = createAccountingApp();

    const b0 = app.getBalance();
    app.handleMenuChoice("2", 120.5);
    app.handleMenuChoice("3", 20.25);
    const b1 = app.getBalance();

    expect(b0).toBe(1000.0);
    expect(b1).toBe(1100.25);
    expect(app.handleMenuChoice("1").output).toBe("Current balance: 1100.25");
  });

  test("TC-011: view balance is read-only", () => {
    const app = createAccountingApp();

    const r1 = app.handleMenuChoice("1").output;
    const r2 = app.handleMenuChoice("1").output;
    const r3 = app.handleMenuChoice("1").output;

    expect(r1).toBe("Current balance: 1000.00");
    expect(r2).toBe("Current balance: 1000.00");
    expect(r3).toBe("Current balance: 1000.00");
  });

  test("TC-012: menu loop continues after successful transaction", () => {
    const app = createAccountingApp();

    const credit = app.handleMenuChoice("2", 10.0);
    const next = app.handleMenuChoice("1");

    expect(credit.continueFlag).toBe("YES");
    expect(credit.output).toBe("Amount credited. New balance: 1010.00");
    expect(next.continueFlag).toBe("YES");
    expect(next.output).toBe("Current balance: 1010.00");
  });
});
