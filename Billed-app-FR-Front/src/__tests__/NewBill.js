/**
 * @jest-environment jsdom
 */

import { fireEvent, screen, waitFor } from "@testing-library/dom"

import NewBillUI from "../views/NewBillUI.js"
import NewBill from "../containers/NewBill.js"

import { ROUTES_PATH, ROUTES } from "../constants/routes.js"
import { localStorageMock } from "../__mocks__/localStorage.js"
import router from "../app/Router.js"
import store from "../__mocks__/store.js"

  // 53 - 71 Envoi du formulaire
  // Vérifier si les données sont bien envoyées, avec la méthode post

describe("Given I am connected as an employee", () => {
  describe("When I am on NewBill Page", () => {

    test("Then send icon in vertical layout should be highlighted", async () => {
      Object.defineProperty(window, 'localStorage', { value: localStorageMock });
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee'
      }));
      
      const root = document.createElement("div");
      root.setAttribute("id", "root");
      document.body.append(root);
      router();
      window.onNavigate(ROUTES_PATH.NewBill);
      await waitFor(() => screen.getByTestId('icon-mail'));
      const mailIcon = screen.getByTestId('icon-mail');

      // Check if the icon is present
      expect(mailIcon.className).toBe('active-icon');
    });

    test("Then the submission form should be displayed", async () => {
      document.body.innerHTML = NewBillUI();
      
      const title = await screen.findByText("Envoyer une note de frais");
      expect(title).toBeTruthy();

      const newBillForm = screen.getByTestId("form-new-bill");
      expect(newBillForm).toBeTruthy();
    });
  })
});

describe("Given I am connected as an employee and I am on the NewBill Page", () => {

  beforeEach(() => {
    document.body.innerHTML = NewBillUI();
    Object.defineProperty(window, 'localStorage', {
      value: {
        getItem: jest.fn(() => JSON.stringify({ type: 'Employee', email: "a@a" })),
        setItem: jest.fn(),
      },
      writable: true,
    });
  });
  
  describe("When I do not fill fields and I click on the sending button", () => {
    test("Then It should renders the NewBill Page", async() => {

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

      await waitFor(() => expect(screen.getByTestId("form-new-bill")).toBeTruthy());
    });
  });
  
  describe("When I do fill fields in correct format, exept the file, and I click on the sending button", () => {
    test("Then It should renders the NewBill Page without sending data", async () => {
      
      // Simulate data
      const newBillData = {
        type: "Restaurants et bars",
        name: "Invitation client",
        commentary: "invitation du client untel à déjeuner",
        date: "2004-04-04",
        amount: 110,
        pct: 10,
        vat: "9",
        commentAdmin: "",
        fileName: "invalid-file.txt"
      };

      // Simulate changes in field content
      const inputExpenseType = screen.getByTestId("expense-type");
      fireEvent.change(inputExpenseType, { target: { value: newBillData.type }});
      expect(inputExpenseType.value).toBe(newBillData.type);

      const inputExpenseName = screen.getByTestId("expense-name");
      fireEvent.change(inputExpenseName, { target: { value: newBillData.name }});
      expect(inputExpenseName.value).toBe(newBillData.name);
      
      const inputDatePicker = screen.getByTestId("datepicker");
      fireEvent.change(inputDatePicker, { target: { value: newBillData.date }});
      expect(inputDatePicker.value).toBe(newBillData.date);
      
      const inputAmount = screen.getByTestId("amount");
      fireEvent.change(inputAmount, { target: { value: newBillData.amount }});
      expect(parseInt(inputAmount.value)).toBe(newBillData.amount);
      
      const inputVat = screen.getByTestId("vat"); // TVA
      fireEvent.change(inputVat, { target: { value: newBillData.vat }});
      expect(inputVat.value).toBe(newBillData.vat);
      
      const inputPct = screen.getByTestId("pct"); // Percentage
      fireEvent.change(inputPct, { target: { value: newBillData.pct }});
      expect(parseInt(inputPct.value)).toBe(newBillData.pct);
      
      const inputCommentary = screen.getByTestId("commentary");
      fireEvent.change(inputCommentary, { target: { value: newBillData.commentary }});
      expect(inputCommentary.value).toBe(newBillData.commentary);
      
      // Simulate an erroneous file
      const inputFile = screen.getByTestId("file");
      fireEvent.change(inputFile, {
        target: {
          files: [new File(["paslebonformat"], "invalid-file.txt", {type: "text/plain"})],
        }
      });

      // Simulate the naviation to test it
      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname });
      };

      const store = jest.fn();
      
      const sending = new NewBill({
        document,
        onNavigate,
        store,
        localStorage: window.localStorage
      });

      const newBillForm = screen.getByTestId("form-new-bill");
      
      // Simulate file change
      const handleChangeFile = jest.fn(sending.handleChangeFile);
      sending.updateBill = jest.fn().mockResolvedValue({});
      inputFile.addEventListener("change", handleChangeFile);
      fireEvent.change(inputFile, {
        target: {
          files: [new File(["paslebonformat"], newBillData.fileName, { type: "text/plain" })]
        }
      });
      await waitFor(() => expect(handleChangeFile).toHaveBeenCalled());

      // Simulate sending the form
      const handleSubmit = jest.fn((e) => e.preventDefault());
      newBillForm.addEventListener("submit", handleSubmit);
      fireEvent.submit(newBillForm); 
      
      // Check that data has not been sent
      await waitFor(() => expect(handleSubmit).toHaveBeenCalled());
      expect(sending.updateBill).not.toHaveBeenCalled();

      // Check the form is still displayed
      expect(screen.getByTestId("form-new-bill")).toBeTruthy();
    });
  });

  // Ajouter un test d'intégration POST new bill
  describe("When I do fill fields in correct format and I click on the sending button", () => {
    test("Then the data is sent correctly", async () => {

      // Simulate data
      const newBillData = {
        type: "Restaurants et bars",
        name: "Invitation client",
        commentary: "invitation du client untel à déjeuner",
        date: "2004-04-04",
        amount: 110,
        pct: 10,
        vat: "9",
        commentAdmin: "",
        fileName: "scan-ticket-de-caisse-avec-tva.jpg"
      };

      // const newBillData = {
      //   id: "47qBXb6fIm2zOKqLzZri",
      //   vat: "9",
      //   status: "pending",
      //   type: "Restaurants et bars",
      //   commentary: "invitation du client untel à déjeuner",
      //   name: "Invitation client",
      //   fileName: "scan-ticket-de-caisse-avec-tva.jpg",
      //   date: "2004-04-04",
      //   amount: 110,
      //   commentAdmin: "",
      //   email: "a@a",
      //   pct: 10
      // };

      const inputExpenseType = screen.getByTestId("expense-type");
      fireEvent.change(inputExpenseType, { target: { value: newBillData.type}});
      expect(inputExpenseType.value).toBe(newBillData.type);

      const inputExpenseName = screen.getByTestId("expense-name");
      fireEvent.change(inputExpenseName, { target: { value: newBillData.name}});
      expect(inputExpenseName.value).toBe(newBillData.name);
      
      const inputDatePicker = screen.getByTestId("datepicker");
      fireEvent.change(inputDatePicker, { target: { value: newBillData.date}});
      expect(inputDatePicker.value).toBe(newBillData.date);
      
      const inputAmount = screen.getByTestId("amount");
      fireEvent.change(inputAmount, { target: { value: newBillData.amount}});
      expect(parseInt(inputAmount.value)).toBe(newBillData.amount);
      
      const inputVat = screen.getByTestId("vat"); // TVA
      fireEvent.change(inputVat, { target: { value: newBillData.vat}});
      expect(inputVat.value).toBe(newBillData.vat);
      
      const inputPct = screen.getByTestId("pct"); // Percentage
      fireEvent.change(inputPct, { target: { value: newBillData.pct}});
      expect(parseInt(inputPct.value)).toBe(newBillData.pct);
      
      const inputCommentary = screen.getByTestId("commentary");
      fireEvent.change(inputCommentary, { target: { value: newBillData.commentary}});
      expect(inputCommentary.value).toBe(newBillData.commentary);
      
      const inputFile = screen.getByTestId("file");
      fireEvent.change(inputFile, {
        target: {
          files: [new File(["bonformat"], newBillData.fileName, { type: "image/jpg" })]
        }
      });
      expect(inputFile.value).toBe(newBillData.fileName);

      // Simulate the naviation to test it
      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname });
      };

      const store = jest.fn();
      
      const sending = new NewBill({
        document,
        onNavigate,
        store,
        localStorage: window.localStorage
      });

      const newBillForm = screen.getByTestId("form-new-bill");

      // Simulate file change
      const handleChangeFile = jest.fn(sending.handleChangeFile);
      sending.updateBill = jest.fn().mockResolvedValue({});
      inputFile.addEventListener("change", handleChangeFile);
      fireEvent.change(inputFile, {
        target: {
          files: [new File(["bonformat"], newBillData.fileName, { type: "image/jpg" })]
        }
      });
      await waitFor(() => expect(handleChangeFile).toHaveBeenCalled());

      // Simulate sending the form
      const handleSubmit = jest.fn((e) => e.preventDefault());
      // notes : on a besoin d'une fonction mais submit gère déjà l'envoi
      newBillForm.addEventListener("submit", handleSubmit);
      fireEvent.submit(newBillForm); 

      // Vérifier ce qui est appelé
      await waitFor(() => expect(handleSubmit).toHaveBeenCalled());

      expect(sending.updateBill).toHaveBeenCalledWith({
        email: "a@a",
        type: newBillData.type,
        name: newBillData.name,
        amount: newBillData.amount,
        date: newBillData.date,
        vat: newBillData.vat,
        pct: newBillData.pct,
        commentary: newBillData.commentary,
        filePath: undefined, // pas sur !!!!
        fileName: newBillData.fileName, // pas sur !!!!
        status: "pending",
      });
    });

    // test("Then it should renders the Bills page", async () => {
    //   await waitFor (() => expect(screen.getByText("Mes notes de frais")).toBeTruthy());
    // });
  });
});