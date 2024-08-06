import { ROUTES_PATH } from "../constants/routes.js"
import Logout from "./Logout.js"

export default class NewBill {

  constructor({ document, onNavigate, store, localStorage }) {
    this.document = document;
    this.onNavigate = onNavigate;
    this.store = store;
    const formNewBill = this.document.querySelector(`form[data-testid="form-new-bill"]`);
    formNewBill.addEventListener("submit", this.handleSubmit);
    const file = this.document.querySelector(`input[data-testid="file"]`);
    file.addEventListener("change", this.handleChangeFile);
    // this.fileUrl = null;
    this.filePath = null;
    this.fileName = null;
    this.billId = null;
    new Logout({ document, localStorage, onNavigate });
  }

  handleChangeFile = e => {
    const file = this.document.querySelector(`input[data-testid="file"]`).files[0];
    const fileName = e.target.files[0]?.name;    
    const fileExtension = fileName.split(".").pop(); 

    const formData = new FormData();
    const email = JSON.parse(localStorage.getItem("user")).email;
    formData.append("file", file);
    formData.append("email", email);

    if (fileExtension === "jpeg" || fileExtension === "jpg" || fileExtension === "png") {
      this.store
        .bills()
        .create({
          data: formData,
          headers: {
            noContentType: true
          }
        })
        .then((response) => {
          this.billId = response.key
          this.filePath = response.filePath
          this.fileName = fileName
        }).catch(error => console.error(error));
    }
  }

  handleSubmit = e => {
    e.preventDefault();

    // console.log(e.target.querySelector(`input[data-testid='file']`).value);

    if (this.filePath === null) {
      this.onNavigate(ROUTES_PATH["NewBill"]);
      window.alert("Merci de fournir un document en .jpg, .png ou .jpeg");

    } else {
      // console.log("e.target.querySelector(`input[data-testid='datepicker']`).value", e.target.querySelector(`input[data-testid="datepicker"]`).value);
      const email = JSON.parse(localStorage.getItem("user")).email;
      const bill = {
        email,
        type: e.target.querySelector(`select[data-testid="expense-type"]`).value,
        name:  e.target.querySelector(`input[data-testid="expense-name"]`).value,
        amount: parseInt(e.target.querySelector(`input[data-testid="amount"]`).value),
        date:  e.target.querySelector(`input[data-testid="datepicker"]`).value,
        vat: e.target.querySelector(`input[data-testid="vat"]`).value,
        pct: parseInt(e.target.querySelector(`input[data-testid="pct"]`).value) || 20,
        commentary: e.target.querySelector(`textarea[data-testid="commentary"]`).value,
        // fileUrl: this.fileUrl,
        filePath: this.filePath,
        fileName: this.fileName,
        status: "pending"
      };
      this.updateBill(bill);     
      this.onNavigate(ROUTES_PATH["Bills"]);
    }
  }

  // not need to cover this function by tests
  updateBill = (bill) => {
    if (this.store) {
      this.store
      .bills()
      .update({data: JSON.stringify(bill), selector: this.billId})
      .then(() => {
        this.onNavigate(ROUTES_PATH["Bills"])
      })
      .catch(error => console.error(error))
    }
  }
}