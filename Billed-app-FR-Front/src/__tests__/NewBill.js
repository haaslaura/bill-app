/**
 * @jest-environment jsdom
 */

import { screen, waitFor } from "@testing-library/dom"
import NewBillUI from "../views/NewBillUI.js"
import NewBill from "../containers/NewBill.js"

import { ROUTES_PATH } from "../constants/routes.js"
import { localStorageMock } from "../__mocks__/localStorage.js"
import router from "../app/Router.js"

// Vérifier si les données sont bien envoyées, avec la méthode post

describe("Given I am connected as an employee", () => {
  describe("When I am on NewBill Page", () => {
    test("Then ...", () => {
      const html = NewBillUI()
      document.body.innerHTML = html
      //to-do write assertion
    })

    test("Then send icon in vertical layout should be highlighted", async () => {

      Object.defineProperty(window, 'localStorage', { value: localStorageMock })
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee'
      }))
      const root = document.createElement("div")
      root.setAttribute("id", "root")
      document.body.append(root)
      router()
      window.onNavigate(ROUTES_PATH.NewBill)
      await waitFor(() => screen.getByTestId('icon-mail'))
      const mailIcon = screen.getByTestId('icon-mail')

      // Check if the icon is present
      expect(mailIcon.className).toBe('active-icon')

    })
  })

// S’il navigue en arrière, il reste connecté.
// S’il clique sur le bouton “Se déconnecter”, il est envoyé sur la page Login.

// Les champs Date, Montant, TVA, %, Justificatif sont obligatoires
// Les champs montant et TVA doivent être positif
// La date ne doit pas être postérieur à celle du jour
// le fichier doit être uniquement en jpg, jpeg et pnj



})
