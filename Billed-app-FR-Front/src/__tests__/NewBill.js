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
  
  describe("When I do not fill fields and I click on the sending button", () => {
    test("Then It should renders the NewBill Page", async() => {
      document.body.innerHTML = NewBillUI();

      const newBillForm = screen.getByTestId("form-new-bill");
      expect(newBillForm).toBeTruthy();

      // Simuler des champs vides
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

      // Simuler l'envoi du formulaire
      const handleSubmit = jest.fn((e) => e.preventDefault());
      newBillForm.addEventListener("submit", handleSubmit);
      fireEvent.submit(newBillForm);

      await waitFor(() => expect(screen.getByTestId("form-new-bill")).toBeTruthy());
    });
  });
  
  // 22 - 48 : Envoyer le fichier au bon format
  // 53 - 71 Envoi du formulaire
  // Vérifier si les données sont bien envoyées, avec la méthode post

  // Ajouter un test d'intégration POST new bill
  describe("When I do fill fields in correct format and I click on the sending button", () => {
    test("Then the data is sent correctly", async () => {
      document.body.innerHTML = NewBillUI();

      // Simuler les données entrées
      const newBill = {
        id: "47qBXb6fIm2zOKqLzZri",
        vat: "9",
        fileUrl: "https://test.storage.tld/v0/b/billable-677b6.a…f-1.jpg?alt=media&token=c1640e12-a24b-4b11-ae52-529112e9602a",
        status: "pending",
        type: "Restaurants et bars",
        commentary: "invitation du client untel à déjeuner",
        name: "Invitation client",
        fileName: "scan-ticket-de-caisse-avec-tva.jpg",
        date: "2004-04-04",
        amount: 110,
        commentAdmin: "",
        email: "a@a",
        pct: 10
      };

      const inputExpenseType = screen.getByTestId("expense-type");
      fireEvent.change(inputExpenseType, { target: { value: newBill.type}});
      expect(inputExpenseType.value).toBe(newBill.type);

      const inputExpenseName = screen.getByTestId("expense-name");
      fireEvent.change(inputExpenseName, { target: { value: newBill.name}});
      expect(inputExpenseName.value).toBe(newBill.name);
      
      const inputDatePicker = screen.getByTestId("datepicker");
      fireEvent.change(inputDatePicker, { target: { value: newBill.date}});
      expect(inputDatePicker.value).toBe(newBill.date);
      
      const inputAmount = screen.getByTestId("amount");
      fireEvent.change(inputAmount, { target: { value: newBill.amount}});
      expect(parseInt(inputAmount.value)).toBe(newBill.amount);
      
      const inputVat = screen.getByTestId("vat"); // TVA
      fireEvent.change(inputVat, { target: { value: newBill.vat}});
      expect(inputVat.value).toBe(newBill.vat);
      
      const inputPct = screen.getByTestId("pct"); // Percentage
      fireEvent.change(inputPct, { target: { value: newBill.pct}});
      expect(parseInt(inputPct.value)).toBe(newBill.pct);
      
      const inputCommentary = screen.getByTestId("commentary");
      fireEvent.change(inputCommentary, { target: { value: newBill.commentary}});
      expect(inputCommentary.value).toBe(newBill.commentary);
      
      const inputFile = screen.getByTestId("file");
      fireEvent.change(inputFile, { target: { value: newBill.fileName}});
      expect(inputFile.value).toBe(newBill.fileName);

      const newBillForm = screen.getByTestId("form-new-bill");

      // localStorage should be populated with form data
      Object.defineProperty(window, "localStorage", {
        value: localStorageMock,
        writable: true,
      });

      window.localStorage.setItem("user", JSON.stringify({
        email: "a@a"
      }));

      // we have to mock navigation to test it
      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname });
      };

      const sending = new NewBill({
        document,
        onNavigate,
        store,
        localStorage: window.localStorage
      });

      // Simuler l'envoi du formulaire avec les fonctions correspondantes
      const handleSubmit = jest.fn(sending.handleSubmit);
      sending.updateBill = jest.fn().mockResolvedValue({});

      newBillForm.addEventListener("submit", handleSubmit);
      fireEvent.submit(newBillForm);

      // Vérifier ce qui est appelé
      await waitFor(() => expect(handleSubmit).toHaveBeenCalled());

      expect(sending.updateBill).toHaveBeenCalledWith({
        email: "a@a",
        type: newBill.type,
        name: newBill.name,
        amount: newBill.amount,
        date: newBill.date,
        vat: newBill.vat,
        pct: newBill.pct,
        commentary: newBill.commentary,
        filePath: undefined, // pas sur !!!!
        fileName: newBill.fileName, // pas sur !!!!
        status: "pending",
      });
    });

    test("Then it should renders the Bills page", async () => {
      await waitFor (() => expect(screen.getByText("Mes notes de frais")).toBeTruthy());
    });
  });
});