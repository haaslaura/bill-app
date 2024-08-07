/**
 * @jest-environment jsdom
 */

import { fireEvent, screen, waitFor } from "@testing-library/dom";

import NewBill from "../containers/NewBill.js";
import NewBillUI from "../views/NewBillUI.js";

import { ROUTES, ROUTES_PATH } from "../constants/routes";
import { localStorageMock } from "../__mocks__/localStorage.js";
import mockStore from "../__mocks__/store";

import router from "../app/Router";

import { incorrectBillData } from "../fixtures/bills.js"
import { correctBillData } from "../fixtures/bills.js"
import BillsUI from "../views/BillsUI.js";

jest.mock("../app/Store", () => mockStore);


describe("Given I am connected as an employee", () => {
  
  describe("When I am on NewBill Page", () => {
    
    beforeEach(() => {
      Object.defineProperty(window, "localStorage", { value: localStorageMock });
      window.localStorage.setItem("user", JSON.stringify({
        type: "Employee"
      }));
    });
    
    test("Then send icon in vertical layout should be highlighted", () => {
      
      const root = document.createElement("div");
      root.setAttribute("id", "root");
      document.body.append(root);
      router();
      window.onNavigate(ROUTES_PATH.NewBill);
      const mailIcon = screen.getByTestId('icon-mail');
      
      // Check if the icon is present
      expect(mailIcon.className).toBe('active-icon');
    });
    
    test("Then the submission form should be displayed", () => {
      
      document.body.innerHTML = NewBillUI();
      expect(screen.findByText("Envoyer une note de frais")).toBeTruthy();
      expect(screen.getByTestId("form-new-bill")).toBeTruthy();
    });
  })
});

describe("Given I am connected as an employee and I am on the NewBill Page", () => {
  
  describe("When I do not fill fields and I click on the sending button", () => {

    test("Then It should renders the NewBill Page", () => {
      
      const newBillForm = screen.getByTestId("form-new-bill");
      
      // Simulate empty fields
      const inputExpenseName = screen.getByTestId("expense-name");
      expect(inputExpenseName.value).toBe("");
      const inputDatePicker = screen.getByTestId("datepicker");
      expect(inputDatePicker.value).toBe("");
      const inputAmount = screen.getByTestId("amount");
      expect(inputAmount.value).toBe("");
      const inputVat = screen.getByTestId("vat"); // TVA
      expect(inputVat.value).toBe("");
      const inputPct = screen.getByTestId("pct"); // Percentage
      expect(inputPct.value).toBe("");
      const inputCommentary = screen.getByTestId("commentary");
      expect(inputCommentary.value).toBe("");
      const inputFile = screen.getByTestId("file");
      expect(inputFile.value).toBe("");
      
      // Simulate sending the form
      const handleSubmit = jest.fn((e) => e.preventDefault());
      newBillForm.addEventListener("submit", handleSubmit);
      fireEvent.submit(newBillForm);
      
      expect(screen.getByTestId("form-new-bill")).toBeTruthy();
    });
  });
  
  describe("When I do fill fields in correct format, exept the file, and I click on the sending button", () => {
    
    test("Then It should renders the NewBill Page", () => {    
      
      // Simulate changes in field content
      const inputExpenseType = screen.getByTestId("expense-type");
      fireEvent.change(inputExpenseType, { target: { value: incorrectBillData.type }});
      expect(inputExpenseType.value).toBe(incorrectBillData.type);
      
      const inputExpenseName = screen.getByTestId("expense-name");
      fireEvent.change(inputExpenseName, { target: { value: incorrectBillData.name }});
      expect(inputExpenseName.value).toBe(incorrectBillData.name);
      
      const inputDatePicker = screen.getByTestId("datepicker");
      fireEvent.change(inputDatePicker, { target: { value: incorrectBillData.date }});
      expect(inputDatePicker.value).toBe(incorrectBillData.date);
      
      const inputAmount = screen.getByTestId("amount");
      fireEvent.change(inputAmount, { target: { value: incorrectBillData.amount }});
      expect(parseInt(inputAmount.value)).toBe(incorrectBillData.amount);
      
      const inputVat = screen.getByTestId("vat"); // TVA
      fireEvent.change(inputVat, { target: { value: incorrectBillData.vat }});
      expect(inputVat.value).toBe(incorrectBillData.vat);
      
      const inputPct = screen.getByTestId("pct"); // Percentage
      fireEvent.change(inputPct, { target: { value: incorrectBillData.pct }});
      expect(parseInt(inputPct.value)).toBe(incorrectBillData.pct);
      
      const inputCommentary = screen.getByTestId("commentary");
      fireEvent.change(inputCommentary, { target: { value: incorrectBillData.commentary }});
      expect(inputCommentary.value).toBe(incorrectBillData.commentary);
      
      const inputFile = screen.getByTestId("file");
      
      
      // Simulate the naviation to test it
      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname });
      };
      
      const sending = new NewBill({
        document,
        onNavigate,
        store: null,
        localStorage: window.localStorage
      });
      
      // Simulate handleChangeFile() function
      const handleChangeFile = jest.fn((e) => sending.handleChangeFile(e));
      inputFile.addEventListener("change", handleChangeFile);
      fireEvent.change(inputFile, {
        target: {
          files: [new File(["paslebonformat"], incorrectBillData.fileName, {type: "text/plain"})],
        }
      });
      expect(handleChangeFile).toHaveBeenCalled();
      
      // Simulate sending the form
      const newBillForm = screen.getByTestId("form-new-bill");
      const handleSubmit = jest.fn((e) => e.preventDefault());
      
      newBillForm.addEventListener("submit", handleSubmit);
      fireEvent.submit(newBillForm); 
      expect(screen.getByTestId("form-new-bill")).toBeTruthy();
    });
  });
  
  describe("When I do fill fields in correct format and I click on the sending button", () => {
    
    beforeEach(() => {
      jest.spyOn(mockStore, "bills");
      Object.defineProperty(
          window,
          "localStorage",
          { value: localStorageMock }
      );

      window.localStorage.setItem("user", JSON.stringify({
        type: "Employee",
        email: "a@a"
      }));

      const root = document.createElement("div");
      root.setAttribute("id", "root");
      document.body.appendChild(root);
      router();
    });

    // Check integration using the POST method
    test("Then the data is sent correctly", async () => {

      // Simulate the navigation to test it
      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname });
      };
      window.onNavigate(ROUTES_PATH.NewBill);

      const sending = new NewBill({
        document,
        onNavigate,
        store: mockStore,
        localStorage: window.localStorage
      });

      document.body.innerHTML = NewBillUI();
      
      // Simulate changes in field content
      const inputExpenseType = screen.getByTestId("expense-type");
      fireEvent.change(inputExpenseType, { target: { value: correctBillData.type}});
      expect(inputExpenseType.value).toBe(correctBillData.type);
      
      const inputExpenseName = screen.getByTestId("expense-name");
      fireEvent.change(inputExpenseName, { target: { value: correctBillData.name}});
      expect(inputExpenseName.value).toBe(correctBillData.name);
      
      const inputDatePicker = screen.getByTestId("datepicker");
      fireEvent.change(inputDatePicker, { target: { value: correctBillData.date}});
      expect(inputDatePicker.value).toBe(correctBillData.date);
      
      const inputAmount = screen.getByTestId("amount");
      fireEvent.change(inputAmount, { target: { value: correctBillData.amount}});
      expect(parseInt(inputAmount.value)).toBe(correctBillData.amount);
      
      const inputVat = screen.getByTestId("vat"); // TVA
      fireEvent.change(inputVat, { target: { value: correctBillData.vat}});
      expect(inputVat.value).toBe(correctBillData.vat);
      
      const inputPct = screen.getByTestId("pct"); // Percentage
      fireEvent.change(inputPct, { target: { value: correctBillData.pct}});
      expect(parseInt(inputPct.value)).toBe(correctBillData.pct);
      
      const inputCommentary = screen.getByTestId("commentary");
      fireEvent.change(inputCommentary, { target: { value: correctBillData.commentary}});
      expect(inputCommentary.value).toBe(correctBillData.commentary);
      
      const inputFile = screen.getByTestId("file");
      
      // Mock bills' create and uptdate methods
      const mockCreate = jest.fn().mockResolvedValue({ key: '1234', filePath: 'mock/file/path' });
      const mockUpdate = jest.fn().mockResolvedValue({});
      mockStore.bills = jest.fn().mockImplementation(() => {
          return {
              create: mockCreate,
              update: mockUpdate,
          };
      });
      
      // Simulate handleChangeFile() function
      const handleChangeFile = jest.fn((e) => sending.handleChangeFile(e));
      const fileTested = new File(["bonformat"], correctBillData.fileName, {type: "image/jpg"})
      inputFile.addEventListener("change", handleChangeFile);
      fireEvent.change(inputFile, {
        target: {
          files: [fileTested],
        }
      });

      // Wait for resolution ongoing process
      await new Promise (process.nextTick);

      expect(handleChangeFile).toHaveBeenCalled();
      expect(mockCreate).toHaveBeenCalledWith(expect.objectContaining({
        data: expect.any(FormData),
        headers: { noContentType: true }
      }));
     
      sending.updateBill = jest.fn(sending.updateBill.bind(sending));
     
      // Simulate sending form
      const newBillForm = screen.getByTestId("form-new-bill");
      const handleSubmit = jest.fn((e) => sending.handleSubmit(e));
      newBillForm.addEventListener("submit", handleSubmit);
      fireEvent.submit(newBillForm);

      expect(handleSubmit).toHaveBeenCalled();
      expect(sending.updateBill).toHaveBeenCalled();

      expect(mockUpdate).toHaveBeenCalledWith(expect.objectContaining({
        data: JSON.stringify({
          type: correctBillData.type,
          name: correctBillData.name,
          amount: correctBillData.amount,
          date: correctBillData.date,
          vat: correctBillData.vat,
          pct: correctBillData.pct,
          commentary: correctBillData.commentary,
          filePath: "mock/file/path",
          fileName: correctBillData.fileName,
          status: "pending",
        }),
        selector: "1234",
      }));
      
    });
    
    test("Then it should renders the Bills page", () => {
      expect(screen.queryByText("Mes notes de frais")).toBeTruthy();
    });
  });

  // Error 404 & 500 test
  describe("When an error occurs on API", () => {

    test("Then fetches messages from an API and fails with 404 message error", async () => {
      const html = BillsUI({ error: "Erreur 404" });
      document.body.innerHTML = html;

      await waitFor(() => screen.getByText("Erreur 404"));
      expect(screen.getByText("Erreur 404")).toBeTruthy();
    });

    test("Then fetches messages from an API and fails with 500 message error", async () => {
      const html = BillsUI({ error: "Erreur 500" });
      document.body.innerHTML = html;

      await waitFor(() => screen.getByText("Erreur 500"));
      expect(screen.getByText("Erreur 500")).toBeTruthy();
    });
  });

});