/**
 * @jest-environment jsdom
 */

// ajout :
// import _modal from "jquery-modal";

import { findAllByTestId, fireEvent, screen, waitFor } from "@testing-library/dom";
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

    })

    test("Then the bills are displayed", async () => {
      
      // on construit la page avec les data 'bills'
      document.body.innerHTML = BillsUI({ data: bills });
      
      // on récupère la liste affichée
      // const listBills = screen.getAllByTestId('tbody tr')
      await waitFor (() => screen.getAllByTestId("tbody tr"));
      const listBills = screen.getAllByTestId("tbody tr");
      // data-testid="tbody"

      console.log(listBills);
      console.log(bills);
      
      expect(listBills.length).toBe(bills.length)
    })

    test("Then bills should be ordered from earliest to latest", () => {
      document.body.innerHTML = BillsUI({ data: bills })
      const dates = screen.getAllByText(/^(19|20)\d\d[- /.](0[1-9]|1[012])[- /.](0[1-9]|[12][0-9]|3[01])$/i).map(a => a.innerHTML)

      const antiChrono = (a, b) => ((a < b) ? 1 : -1)
      const datesSorted = [...dates].sort(antiChrono);

      expect(dates).toEqual(datesSorted);
    })
  })

  describe("When I am on Bills Page and I click on the eye icon", () => {
    test("The modal should open and display an image", async () => {
      
      // Object.defineProperty(window, 'localStorage', { value: localStorageMock })
      // window.localStorage.setItem('user', JSON.stringify({
      //   type: 'Employee'
      // }))
      // document.body.innerHTML = BillsUI({ data: bills })
      // const onNavigate = (pathname) => {
      //   document.body.innerHTML = ROUTES({ pathname })
      // }

      // const store = null
      // const billsBoard = new Bills({
      //   document, onNavigate, store, bills, localStorage: window.localStorage 
      // })
            
      // const handleShowModal = jest.fn((icon) => billsBoard.handleClickIconEye(icon))
      // const allEyeIcon = screen.getAllByTestId("icon-eye")

      // allEyeIcon.forEach((icon) => {
      //   icon.addEventListener('click', handleShowModal(icon))
      //   userEvent.click(icon)
      //   expect(handleShowModal).toHaveBeenCalled()

      //   await waitFor(() => screen.getByTestId("modaleFile"))
      //   expect(screen.getByTestId("modaleFile")).toBeTruthy()
      // })

      // // icon.addEventListener('click', handleShowModal)
      // // userEvent.click(icon)
      // // expect(handleShowModal).toHaveBeenCalled()

      // // const modaleE = screen.getByTestId("modaleFile")
      // // expect(modaleE).toBeTruthy()
    })
  })
})


// test d'intégration GET
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
    })
  })

  describe("When an error occurs on API", () => {
    beforeEach(() => {
      jest.spyOn(mockStore, "bills")
      Object.defineProperty(
          window,
          'localStorage',
          { value: localStorageMock }
      )
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee',
        email: "a@a"
      }))
      const root = document.createElement("div")
      root.setAttribute("id", "root")
      document.body.appendChild(root)
      router()
    })

  //   test("fetches bills from an API and fails with 404 message error", async () => {

  //     mockStore.bills.mockImplementationOnce(() => {
  //       return {
  //         list : () =>  {
  //           return Promise.reject(new Error("Erreur 404"))
  //         }
  //       }})
  //     window.onNavigate(ROUTES_PATH.Bills)
  //     await new Promise(process.nextTick);
  //     const message = await screen.findByText(/Erreur 404/)
  //     expect(message).toBeTruthy()
  //   })

  //   test("fetches messages from an API and fails with 500 message error", async () => {

  //     mockStore.bills.mockImplementationOnce(() => {
  //       return {
  //         list : () =>  {
  //           return Promise.reject(new Error("Erreur 500"))
  //         }
  //       }})

  //     window.onNavigate(ROUTES_PATH.Bills)
  //     await new Promise(process.nextTick);
  //     const message = await screen.findByText(/Erreur 500/)
  //     expect(message).toBeTruthy()
  //   })
  })

})