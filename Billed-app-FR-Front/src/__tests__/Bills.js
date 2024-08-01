/**
 * @jest-environment jsdom
 */

import { screen, waitFor, within } from "@testing-library/dom";
import userEvent from "@testing-library/user-event";

import BillsUI from "../views/BillsUI.js";
import Bills from "../containers/Bills.js";
import { bills } from "../fixtures/bills";

import { ROUTES, ROUTES_PATH } from "../constants/routes";
import { localStorageMock } from "../__mocks__/localStorage.js";
import mockStore from "../__mocks__/store";
import router from "../app/Router";

// For the test of the modal
import $ from 'jquery';
$.fn.modal = jest.fn(); // Mock jQuery modal function

jest.mock("../app/Store", () => mockStore);


describe("Given I am connected as an employee", () => {

  describe("When I am on Bills page but it is loading", () => {
    test("Then, Loading page should be rendered", () => {
      document.body.innerHTML = BillsUI({ loading: true });
      expect(screen.getAllByText("Loading...")).toBeTruthy();
    });
  });

  describe("When I am on Bills page but back-end send an error message", () => {
    test("Then, Error page should be rendered", () => {
      document.body.innerHTML = BillsUI({ error: 'some error message' });
      expect(screen.getAllByText('Erreur')).toBeTruthy();
    });
  });

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
      expect(windowIcon.className).toBe('active-icon');
    });

    test("Then the bills are displayed", () => {
      document.body.innerHTML = BillsUI({ data: bills });
      const tbody = screen.getByTestId("tbody");
      const listBills = within(tbody).getAllByRole("row");
      expect(listBills.length).toBe(4);
    });

    test("Then bills should be ordered from earliest to latest", () => {
      document.body.innerHTML = BillsUI({ data: bills });
      const dates = screen.getAllByText(/^(19|20)\d\d[- /.](0[1-9]|1[012])[- /.](0[1-9]|[12][0-9]|3[01])$/i).map(a => a.innerHTML)
      const antiChrono = (a, b) => ((a < b) ? 1 : -1);
      const datesSorted = [...dates].sort(antiChrono);
      expect(dates).toEqual(datesSorted);
    });
  });

  describe("When I am on Bills Page and a wrong date is send", () => {
    test("Then it should catch the error and return the unformatted date", async () => {

      jest.spyOn(mockStore, "bills");
      Object.defineProperty(
          window,
          'localStorage',
          { value: localStorageMock }
      );
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee',
        email: "a@a"
      }));
      const root = document.createElement("div");
      root.setAttribute("id", "root");
      document.body.appendChild(root);
      router();

      mockStore.bills.mockImplementationOnce(() => {
        return {
          list : () =>  {
            return Promise.reject(new Error("Invalid date format"))
          }
        }});
      window.onNavigate(ROUTES_PATH.Bills);
      await new Promise(process.nextTick);
      const message = await screen.getByText(/Invalid date format/);
      expect(message).toBeTruthy();

    });
  });

  describe("When I am on Bills Page and I click on the new Bill's button", () => {
    test("Then I'm redirected to the New Bill page", () => {
      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname })
      };
      const billsboard = new Bills({
        document, onNavigate, store: null, localStorage: window.localStorage,
      });

      document.body.innerHTML = BillsUI({ data: bills });
      
      const handleNewBillClick = jest.fn(() => billsboard.handleClickNewBill());

      const btn = screen.getByTestId("btn-new-bill");
      btn.addEventListener("click", handleNewBillClick);
      userEvent.click(btn);
      expect(handleNewBillClick).toHaveBeenCalled();
    });
  });

  // Check handleClickIconEye()
  describe("When I am on Bills Page and I click on the eye icon", () => {
    test("Then a modal should open", () => {
  
      Object.defineProperty(window, "localStorage", { value: localStorageMock });
      window.localStorage.setItem("user", JSON.stringify({
        type: "Employee"
      }));

      document.body.innerHTML = BillsUI({ data: bills });
      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname });
      };
      const billsboard = new Bills({
        document, onNavigate, store: null, localStorage: window.localStorage
      });

      
      // Retrieve all icons
      const eyeIcons = screen.getAllByTestId("icon-eye");

      // Test on the first eye icon
      const eye = eyeIcons[0];
      expect(eye).toBeTruthy();

      const handleClickIconEye = jest.fn((icon) => billsboard.handleClickIconEye(icon));
      eye.addEventListener("click", handleClickIconEye(eye));
      userEvent.click(eye);
      expect(handleClickIconEye).toHaveBeenCalled();

      const modal = screen.getByTestId("modaleFileEmployee");
      expect(modal).toBeTruthy();
    });
  });

  // Check handleClickIconDownload()
  describe("When I am on Bills Page and I click on the download icon", () => {

    // Réinitialiser document.createElement après chaque test
    const originalCreateElement = document.createElement;
    afterEach(() => document.createElement = originalCreateElement);

    test("Then the image is download", async () => {
      
      Object.defineProperty(window, "localStorage", { value: localStorageMock })
      window.localStorage.setItem("user", JSON.stringify({
        type: "Employee"
      }));
      document.body.innerHTML = BillsUI({ data: bills });
      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname });
      };
      const billsboard = new Bills({
        document, onNavigate, store: null, localStorage: window.localStorage
      });

      // Mock fetch to return a blob
      global.fetch = jest.fn(() =>
        Promise.resolve({
          blob: () => Promise.resolve(new Blob(["test content"], { type: "image/jpg" }))
        })
      );

      // Mock URL.createObjectURL
      const mockObjectURL = "blob:http://localhost:3000/123456";
      global.URL.createObjectURL = jest.fn(() => mockObjectURL);
      global.URL.revokeObjectURL = jest.fn();

      // Mock document.createElement for the <a> element and its click method
      const mockClick = jest.fn();
      const mockAppendChild = jest.spyOn(document.body, "appendChild").mockImplementation(() => {});
      const mockRemoveChild = jest.spyOn(document.body, "removeChild").mockImplementation(() => {});
      document.createElement = jest.fn().mockImplementation(() => ({
        href: '',
        download: '',
        click: mockClick,
      }));

      // Retrieve all icons
      const downloadIcons = screen.getAllByTestId("icon-download");

      // Test on the first eye icon
      const download = downloadIcons[0];
      expect(download).toBeTruthy();

      // Check if the handler was called
      const handleClickIconDownload = jest.fn((icon) => billsboard.handleClickIconDownload(icon));
      download.addEventListener("click", () => handleClickIconDownload(download));
      userEvent.click(download);
      expect(handleClickIconDownload).toHaveBeenCalled();

      // Wait for the download process to complete
      await waitFor(() => expect(global.fetch).toHaveBeenCalledWith(bills[0].fileUrl));
      await waitFor(() => expect(global.URL.createObjectURL).toHaveBeenCalled());

      // Check if the <a> element was created and its attributes set correctly
      expect(document.createElement).toHaveBeenCalledWith("a");
      expect(mockClick).toHaveBeenCalled();
      expect(mockAppendChild).toHaveBeenCalled();
      expect(mockRemoveChild).toHaveBeenCalled();

      // Clean up mocks
      global.fetch.mockClear();
      global.URL.createObjectURL.mockClear();
      global.URL.revokeObjectURL.mockClear();
      document.createElement.mockClear();
      mockAppendChild.mockRestore();
      mockRemoveChild.mockRestore();
    });
  });
});


// GET integration test
describe("Given I am a user connected as an Employee", () => {
  
  describe("When I navigate to Bills page", () => {

    test("fetches bills from mock API GET", async () => {

    // Mock localStorage
    window.localStorage.setItem("user", JSON.stringify({
      type: "Employee"
    }));
    const root = document.createElement("div");
    root.setAttribute("id", "root");
    document.body.append(root);

    // Initialize router and navigate to Bills page
    router();
    window.onNavigate(ROUTES_PATH.Bills);

    // Ensure the Bills page is rendered and fetch is called
    await waitFor(() => screen.getByText("Mes notes de frais"));
    expect(screen.getByText("Mes notes de frais")).toBeTruthy();
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
        type: "Employee",
        email: "a@a"
      }));

      const root = document.createElement("div");
      root.setAttribute("id", "root");
      document.body.appendChild(root);
      router();
    });

    test("fetches bills from an API and fails with 404 message error", async () => {

      mockStore.bills.mockImplementationOnce(() => {
        return {
          list : () =>  {
            return Promise.reject(new Error("Erreur 404"))
          }
        }});
      window.onNavigate(ROUTES_PATH.Bills);
      await new Promise(process.nextTick);
      const message = screen.getByText(/Erreur 404/);
      expect(message).toBeTruthy();
    });

    test("fetches bills from an API and fails with 500 message error", async () => {

      mockStore.bills.mockImplementationOnce(() => {
        return {
          list : () => Promise.reject(new Error("Erreur 500"))
        }
      });

      window.onNavigate(ROUTES_PATH.Bills);
      await new Promise(process.nextTick);;
      const message = screen.getByText(/Erreur 500/);
      expect(message).toBeTruthy();
    });
  });
});