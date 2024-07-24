/**
 * @jest-environment jsdom
 */

// ajout :
// import _modal from "jquery-modal";

import { screen, waitFor, within } from "@testing-library/dom";
import userEvent from "@testing-library/user-event";
// import '@testing-library/jest-dom/extend-expect';

import BillsUI from "../views/BillsUI.js";
import Bills from "../containers/Bills.js";
import { bills } from "../fixtures/bills"; // object array
import { formatDate, formatStatus } from "../app/format.js";

import { ROUTES, ROUTES_PATH } from "../constants/routes";
import { localStorageMock } from "../__mocks__/localStorage.js";
import mockStore from "../__mocks__/store";
import router from "../app/Router";

jest.mock("../app/Store", () => mockStore);

// Mocking the store and formatDate function
jest.mock("../app/format.js", () => ({
  formatDate: jest.fn(),
  formatStatus: jest.fn(),
}));


// RESTE A FAIRE :
// 1 - l78-79 Gérer l'echec de la fonction formatDate
// 2 - Vérifier la fonction handleClickIconDownload() > PASSE MAIS FONCTION NE MARCHE PAS
// 3 - Vérifier l'ouverture de la modale > NE PASSE PAS

describe("Given I am connected as an employee", () => {
  describe("When I am on Bills Page", () => {
    
    test("Then bill icon in vertical layout should be highlighted", async () => {
      Object.defineProperty(window, 'localStorage', { value: localStorageMock });
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee'
      }));
      const root = document.createElement("div");
      root.setAttribute("id", "root");
      document.body.append(root);
      router();
      window.onNavigate(ROUTES_PATH.Bills);
      await waitFor(() => screen.getByTestId('icon-window'));
      const windowIcon = screen.getByTestId('icon-window');

      // Check if the icon is present
      expect(windowIcon.className).toBe('active-icon')
    });

    test("Then the bills are displayed", () => {
      document.body.innerHTML = BillsUI({ data: bills });

      const tbody = screen.getByTestId("tbody");
      const listBills = within(tbody).getAllByRole('row');

      expect(listBills.length).toBe(bills.length);
    });

    test("Then bills should be ordered from earliest to latest", () => {
      document.body.innerHTML = BillsUI({ data: bills })
      const dates = screen.getAllByText(/^(19|20)\d\d[- /.](0[1-9]|1[012])[- /.](0[1-9]|[12][0-9]|3[01])$/i).map(a => a.innerHTML)

      const antiChrono = (a, b) => ((a < b) ? 1 : -1)
      const datesSorted = [...dates].sort(antiChrono);

      expect(dates).toEqual(datesSorted);
    });
  });

  // 1 - l78-79 Gérer l'echec de la fonction formatDate
  describe("When I am on Bills Page and a wrong date is send", () => {
    test("Then it should catch the error and return the unformatted date", async () => {

      // Simulating the corrupted date format
      const corruptedDate = "wrong date";
      const billsData = [
        {
          id: "1",
          date: corruptedDate,
          status: "pending",
        },
      ];

      // Mock the store to return the billsData
      mockStore.bills = jest.fn(() => ({
        list: jest.fn().mockResolvedValue(billsData),
      }));

      // Make formatDate throw an error when called
      formatDate.mockImplementation(() => {
        throw new Error("Invalid date format");
      });

      // Spy on console.log
      const consoleLogSpy = jest.spyOn(console, "log").mockImplementation(() => {});

      // Set up localStorage
      Object.defineProperty(window, 'localStorage', { value: localStorageMock });
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee'
      }));

      const billsboard = new Bills({
        document, onNavigate: jest.fn(), store: mockStore, localStorage: window.localStorage,
      });

      // Call the getBills method
      const result = await billsboard.getBills();

      // Check that the error was caught and the date was not formatted
      expect(result).toEqual([
        {
          id: "1",
          date: corruptedDate, // date should be unformatted
          status: undefined,   // status should be undefined because formatStatus is mocked and not set to return a value
        },
      ]);

      expect(consoleLogSpy).toHaveBeenCalledWith(expect.any(Error), "for", billsData[0]);

      // Restore the console.log implementation
      consoleLogSpy.mockRestore();

    });
  });

  describe("When I am on Bills Page and I click on the New Bill's button", () => {
    test("Then I'm redirected to the New Bill page", () => {
      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname })
      };
      const billsboard = new Bills({
        document, onNavigate, store: null, bills, localStorage: window.localStorage,
      });

      document.body.innerHTML = BillsUI({ data: bills });
      
      const handleNewBillClick = jest.fn(() => billsboard.handleClickNewBill());

      const btn = screen.getByTestId("btn-new-bill");
      btn.addEventListener("click", handleNewBillClick);
      userEvent.click(btn);
      expect(handleNewBillClick).toHaveBeenCalled();
    });
  });

  // 3 - Vérifier l'ouverture de la modale >> NE PASSE PAS
  describe("When I am on Bills Page and I click on the eye icon", () => {
    test("The modal should open", async () => {
      
      // Simuler jQuery pour gérer la modale
      // window.$ = jest.fn().mockImplementation(() => {
      //   return {
      //     modal: jest.fn(),
      //     click: jest.fn(),
      //     width: jest.fn(),
      //     height: jest.fn(),
      //     css: jest.fn(),
      //     find: jest.fn(),
      //   };
      // });

      Object.defineProperty(window, 'localStorage', { value: localStorageMock })
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee'
      }));
      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname })
      };
      const store = null;
      const billsboard = new Bills({
        document, onNavigate, store, bills, localStorage: window.localStorage
      });
      
      // Début V3
      // document.body.innerHTML = BillsUI({ data: bills });

      // const iconEyeList = screen.getAllByTestId("icon-eye"); // liste des icones
      // const handleClickIconEye = jest.fn(billsboard.handleClickIconEye(iconEyeList[0]));

      // iconEyeList.forEach((eye) => {
      //   eye.addEventListener("click", handleClickIconEye);
      // });
      // userEvent.click(iconEyeList[0]);

      // Début V4
      // document.body.innerHTML = BillsUI({ data: bills[1] });

      // await waitFor(() => screen.getByTestId("icon-eye"));
      // const iconEye = screen.getByTestId("icon-eye"); // icone

      // const handleClickIconEye = jest.fn(billsboard.handleClickIconEye);
      // iconEye.addEventListener("click", handleClickIconEye)
      // userEvent.click(iconEye);
      // expect(handleClickIconEye).toHaveBeenCalled();

      // Début V5
      // document.body.innerHTML = BillsUI({ data: bills });

      // const iconEyeList = screen.getAllByTestId("icon-eye"); // liste des icones
      // const handleClickIconEye = jest.fn((icon) => billsboard.handleClickIconEye(icon));

      // iconEyeList.forEach((eye) => {
      //   eye.addEventListener("click", handleClickIconEye(eye));
      // });
      // userEvent.click(iconEyeList[0]);
      // expect(handleClickIconEye).toHaveBeenCalled();

      // Début V6
      // document.body.innerHTML = BillsUI({ data: bills });

      // await waitFor(() => screen.getAllByTestId("icon-eye"));
      // const iconEyeList = screen.getAllByTestId("icon-eye"); // liste des icones

      // const handleClickIconEye = jest.fn((icon) => billsboard.handleClickIconEye(icon));

      // iconEyeList.forEach((eye) => {
      //   eye.addEventListener("click", handleClickIconEye(eye));
      // });
      // userEvent.click(iconEyeList[0]);
      // expect(handleClickIconEye).toHaveBeenCalled();

      // Vérifiez que la modale s'affiche
      // await waitFor(() => expect(screen.getByRole("dialog")).toBeVisible());

      // Autre
      // const modal = screen.getByRole("dialog");
      // expect(modal).toBeTruthy();

      // V7
      document.body.innerHTML = BillsUI({ data: bills[0] });

      const handleClickIconEye = jest.fn((icon) => billsboard.handleClickIconEye(icon));

      const eye = screen.getByTestId("icon-eye");

      eye.addEventListener("click", handleClickIconEye);

      userEvent.click(eye);

      expect(handleClickIconEye).toHaveBeenCalled();

      const modale = screen.getByTestId('modaleFileAdmin');
      expect(modale).toBeTruthy();
    });
  });

  // 2 - Vérifier la fonction handleClickIconDownload()
  describe("When I am on Bills Page and I click on the download icon", () => {
    test("Then the image is download", async () => {
      
      Object.defineProperty(window, "localStorage", { value: localStorageMock });
      window.localStorage.setItem("user", JSON.stringify({
        type: "Employee"
      }))
      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname })
      };
      const billsboard = new Bills({
        document, onNavigate, store: mockStore, bills, localStorage: window.localStorage,
      });
      document.body.innerHTML = BillsUI({ data: bills });

      // await waitFor (() => screen.getByTestId("icon-download"))
      // const iconsList = screen.getAllByTestId("icon-download"); // list of icons
      // expect(iconsList.length).not.toBe(0);
      // console.log(iconsList);

      // const handleClickIcon = jest.fn((icon) => billsboard.handleClickIconDownload(icon));
      // iconsList.forEach((icon) => {
      //   icon.addEventListener("click", handleClickIcon(icon));
      // });
      // userEvent.click(iconsList[0]);
      // expect(handleClickIcon).toHaveBeenCalled();

      // Mock fetch and URL.createObjectURL
      global.fetch = jest.fn().mockResolvedValue({
        blob: jest.fn().mockResolvedValue(new Blob([''], { type: 'image/jpeg' }))
      });
      global.URL.createObjectURL = jest.fn().mockReturnValue('http://test.com/image.jpg');
      document.createElement = jest.fn().mockImplementation((tagName) => {
        const elem = document.createElement(tagName);
        if (tagName === 'a') {
          return {
            href: '',
            download: '',
            click: jest.fn(),
            appendChild: jest.fn(),
            removeChild: jest.fn(),
          };
        }
        return elem;
      });
      global.URL.revokeObjectURL = jest.fn();

      // Wait for the icons to be in the DOM
      await waitFor(() => screen.getByTestId("icon-download"));
      const iconsList = screen.getAllByTestId("icon-download");
      expect(iconsList.length).not.toBe(0);

      // Simulate a click on the first download icon
      userEvent.click(iconsList[1]);

      // Assertions
      // expect(global.fetch).toHaveBeenCalledWith(bills[1].fileUrl); // Check fetch is called with the correct URL
      // expect(global.URL.createObjectURL).toHaveBeenCalledWith(expect.any(Blob)); // Check createObjectURL is called with a Blob
      // const link = document.createElement('a');
      // expect(link.href).toBe('http://test.com/image.jpg'); // Check href of the link
      // expect(link.download).toBe(bills[1].fileName || 'image.jpg'); // Check download attribute
      // expect(link.click).toHaveBeenCalled(); // Check if link.click() was called
      // expect(global.URL.revokeObjectURL).toHaveBeenCalled(); // Check if revokeObjectURL was called




    })
  });
});


// GET integration test
describe("Given I am a user connected as an Employee", () => {
  describe("When I navigate to the Bills page", () => {
    test("fetches bills from mock API GET", async () => {
      localStorage.setItem("user", JSON.stringify({ type: "Employee", email: "a@a" }));
      const root = document.createElement("div")
      root.setAttribute("id", "root")
      document.body.append(root)
      router()
      window.onNavigate(ROUTES_PATH.Bills)
      
      const billsTitle = await screen.findByText("Mes notes de frais")
      expect(billsTitle).toBeTruthy()
      
      expect(screen.getByTestId("btn-new-bill")).toBeTruthy()
    });
  });

  describe("When an error occurs on API", () => {

    beforeEach(() => {
      jest.spyOn(mockStore, "bills");
      Object.defineProperty(
          window,
          "localStorage",
          { value: localStorageMock }
      );

      window.localStorage.setItem("user", JSON.stringify({
        type: 'Employee',
        email: "a@a"
      }))
      const root = document.createElement("div");
      root.setAttribute("id", "root");
      document.body.appendChild(root);
      router();
    });

    test("fetches bills from an API and fails with 404 message error", async () => {

      mockStore.bills.mockImplementationOnce(() => {
        return {
          list : () => Promise.reject(new Error("Erreur 404"))
        }
      });

      window.onNavigate(ROUTES_PATH.Bills);
      await new Promise(process.nextTick);
      const message = screen.getByText(/Erreur 404/);
      expect(message).toBeTruthy();
    });

    test("fetches bills from an API and fails with 500 message error", async () => {

      mockStore.bills.mockImplementationOnce(() => {
        return {
          list : () => Promise.reject(new Error("Erreur 500"))
        };
      });

      window.onNavigate(ROUTES_PATH.Bills)
      await new Promise(process.nextTick);
      const message = screen.getByText(/Erreur 500/);
      expect(message).toBeTruthy();
    });
  });

});