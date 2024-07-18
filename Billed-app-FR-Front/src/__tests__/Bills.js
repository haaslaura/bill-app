/**
 * @jest-environment jsdom
 */

import {screen, waitFor} from "@testing-library/dom"
import BillsUI from "../views/BillsUI.js"
import { bills } from "../fixtures/bills.js"
import { ROUTES_PATH} from "../constants/routes.js";
import {localStorageMock} from "../__mocks__/localStorage.js";

import router from "../app/Router.js";

// partie ajouté
// import {mockedBills} from "../__mocks__/store"
// jest.mock("../app/store", () => mockedBills)
// fin
// TypeError: Cannot read properties of undefined (reading 'default')
// sur fichier Bills et sur fichier Login
// >> résultat différent lorsque les lignes 14 et 15 sont commentées

describe("Given I am connected as an employee", () => {
  describe("When I am on Bills Page", () => {
    test("Then bill icon in vertical layout should be highlighted", async () => {

      Object.defineProperty(window, 'localStorage', { value: localStorageMock })
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee'
      }))
      const root = document.createElement("div")
      root.setAttribute("id", "root")
      document.body.append(root)
      router()
      window.onNavigate(ROUTES_PATH.Bills)
      await waitFor(() => screen.getByTestId('icon-window'))
      const windowIcon = screen.getByTestId('icon-window')

      //to-do write expect expression - partie ajouté
      // Vérifier si l'icone contient la classe 'active-icon'
      expect(windowIcon.className).toBe('active-icon')
      // fin

    })
    test("Then bills should be ordered from earliest to latest", () => {
      document.body.innerHTML = BillsUI({ data: bills })
      const dates = screen.getAllByText(/^(19|20)\d\d[- /.](0[1-9]|1[012])[- /.](0[1-9]|[12][0-9]|3[01])$/i).map(a => a.innerHTML)
      // 'dates' est un array contenant tout ce qui correspont à l'exp rég
      const antiChrono = (a, b) => ((a < b) ? 1 : -1)
      // 'antiChrono' est la fonction de trie
      const datesSorted = [...dates].sort(antiChrono)
      // 'datesSorted' est le nouveau tableau
      console.log(dates);
      expect(dates).toEqual(datesSorted)
    })
  })
})
