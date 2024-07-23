/**
 * @jest-environment jsdom
 */

// ajout :
// import _modal from "jquery-modal";

import { screen, waitFor, within } from "@testing-library/dom";
import userEvent from "@testing-library/user-event";

import BillsUI from "../views/BillsUI.js";
import Bills from "../containers/Bills.js";
import { bills } from "../fixtures/bills.js"; // tableau d'objet

import { ROUTES, ROUTES_PATH } from "../constants/routes.js";
import { localStorageMock } from "../__mocks__/localStorage.js";
import mockStore from "../__mocks__/store";
import router from "../app/Router.js";

// ajout :
jest.mock("../app/Store", () => mockStore);


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

  describe("When I am on Bills Page and I click on the eye icon", () => {
    test("The modal should open and display an image", () => {
      
      // const onNavigate = (pathname) => {
      //   document.body.innerHTML = ROUTES({ pathname })
      // };
      // const billsboard = new Bills({
      //   document, onNavigate, store: null, bills, localStorage: window.localStorage,
      // });
      
      // document.body.innerHTML = BillsUI({ data: bills });

      // const handleIconEyeClick = jest.fn((icon) => billsboard.handleClickIconEye(icon))
      
      // const allEyeIcon = screen.getAllByTestId("icon-eye");

      // allEyeIcon.forEach((icon) => {
      //   icon.addEventListener("click", handleIconEyeClick(icon));
      //   userEvent.click(icon);
      //   expect(handleIconEyeClick).toHaveBeenCalled();
      // });

    });
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