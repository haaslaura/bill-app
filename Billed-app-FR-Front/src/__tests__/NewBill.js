/**
 * @jest-environment jsdom
 */

import { fireEvent, screen } from "@testing-library/dom";

import NewBill from "../containers/NewBill.js";
import NewBillUI from "../views/NewBillUI.js";

import { ROUTES, ROUTES_PATH } from "../constants/routes";
import { localStorageMock } from "../__mocks__/localStorage.js";
import mockStore from "../__mocks__/store";
import router from "../app/Router";

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

      // Simulate data
      const newBillData = {
        type: "Restaurants et bars",
        name: "Invitation client",
        commentary: "invitation du client untel à déjeuner",
        date: "2004-04-04",
        amount: 110,
        pct: 10,
        vat: "9",
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
          files: [new File(["paslebonformat"], newBillData.fileName, {type: "text/plain"})],
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

    // Vérifier l'intégration avec la méthode POST
    test("Then the data is sent correctly", async () => {

      // Simulate the navigation to test it
      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname });
      };
      window.onNavigate(ROUTES_PATH.NewBill);

      // Simulate data
      const newBillData = {
        type: "Restaurants et bars",
        name: "Invitation client",
        commentary: "invitation du client untel à déjeuner",
        date: "2004-04-04",
        amount: 110,
        pct: 10,
        vat: "9",
        fileName: "scan-ticket-de-caisse.jpg"
      };

      const sending = new NewBill({
        document,
        onNavigate,
        store: mockStore,
        localStorage: window.localStorage
      });

      document.body.innerHTML = NewBillUI();
      
      // Simulate changes in field content
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
      
      
      // Simulate handleChangeFile() function
      const handleChangeFile = jest.fn((e) => sending.handleChangeFile(e));
      inputFile.addEventListener("change", handleChangeFile);
      fireEvent.change(inputFile, {
        target: {
          files: [new File(["bonformat"], newBillData.fileName, {type: "image/jpg"})],
        }
      });
      expect(handleChangeFile).toHaveBeenCalled();
      

      // Mock la méthode create de bills pour simuler l'envoi des données au serveur
      const mockCreate = jest.fn(mockStore.bills().create);
      mockStore.bills.mockImplementation(() => {
        return {
          create: mockCreate,
          update: jest.fn().mockResolvedValue({}),
        };
      });

      sending.updateBill = jest.fn().mockResolvedValue({});

      // Simulate sending form
      const newBillForm = screen.getByTestId("form-new-bill");
      const handleSubmit = jest.fn((e) => sending.handleSubmit(e));
      newBillForm.addEventListener("submit", handleSubmit);
      fireEvent.submit(newBillForm);
      expect(handleSubmit).toHaveBeenCalled();

      // Vérifier que updateBill est bien appelé
      expect(sending.updateBill).toHaveBeenCalled();

      // Attendre que la méthode create soit appelée
      // expect(mockCreate).toHaveBeenCalledWith(expect.objectContaining({
      //   email: "a@a",
      //   type: newBillData.type,
      //   name: newBillData.name,
      //   amount: newBillData.amount,
      //   date: newBillData.date,
      //   vat: newBillData.vat,
      //   pct: newBillData.pct,
      //   commentary: newBillData.commentary,
      //   filePath: expect.any(String),
      //   fileName: newBillData.fileName,
      //   status: "pending",
      // }));
      
      // expect(mockStore.bills).toHaveBeenCalled();
    });
    
    // test("Then it should renders the Bills page", async () => {
    //   await waitFor(() => screen.getByText("Mes notes de frais"));
    //   expect(screen.getByText("Mes notes de frais")).toBeTruthy();
    // });
  });
});

// Error 404 & 500 test
// describe("Given I am connected as an employee and I am on the NewBill Page", () => { 
//   describe("When an error occurs on API", () => {

//     beforeEach(() => {
//       jest.spyOn(mockStore, "bills");
//       Object.defineProperty(
//           window,
//           "localStorage",
//           { value: localStorageMock }
//       );

//       window.localStorage.setItem("user", JSON.stringify({
//         type: "Employee",
//         email: "a@a"
//       }));

//       const root = document.createElement("div");
//       root.setAttribute("id", "root");
//       document.body.appendChild(root);
//       router();
//     });

//     test("fetches bills from an API and fails with 404 message error", async () => {

//       mockStore.bills.mockImplementationOnce(() => {
//         return {
//           list : () =>  {
//             return Promise.reject(new Error("Erreur 404"))
//           }
//         }});
//       window.onNavigate(ROUTES_PATH.NewBill);
//       await new Promise(process.nextTick);
//       const message = screen.getByText(/Erreur 404/);
//       expect(message).toBeTruthy();
//     });

//     test("fetches bills from an API and fails with 500 message error", async () => {

//       mockStore.bills.mockImplementationOnce(() => {
//         return {
//           list : () => Promise.reject(new Error("Erreur 500"))
//         }
//       });

//       window.onNavigate(ROUTES_PATH.NewBill);
//       await new Promise(process.nextTick);;
//       const message = screen.getByText(/Erreur 500/);
//       expect(message).toBeTruthy();
//     });
//   });
// });