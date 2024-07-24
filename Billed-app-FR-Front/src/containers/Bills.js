import { ROUTES_PATH } from "../constants/routes.js"
import { formatDate, formatStatus } from "../app/format.js"
import Logout from "./Logout.js"

export default class {

  constructor({ document, onNavigate, store, localStorage }) {
    this.document = document;
    this.onNavigate = onNavigate;
    this.store = store;
    const buttonNewBill = document.querySelector(`button[data-testid="btn-new-bill"]`);

    if (buttonNewBill) buttonNewBill.addEventListener("click", this.handleClickNewBill);
   
    const iconEye = document.querySelectorAll(`div[data-testid="icon-eye"]`);
    if (iconEye) iconEye.forEach(icon => {
      icon.addEventListener("click", () => this.handleClickIconEye(icon))
    });

    const iconDownload = document.querySelectorAll(`div[data-testid="icon-download"]`);
    if (iconDownload) iconDownload.forEach(icon => {
      icon.addEventListener("click", () => this.handleClickIconDownload(icon))
    });

    new Logout({ document, localStorage, onNavigate });
  }

  handleClickNewBill = () => {
    this.onNavigate(ROUTES_PATH["NewBill"]);
  }

  handleClickIconEye = (icon) => {
    const billUrl = icon.getAttribute("data-bill-url");
    const imgWidth = Math.floor($("#modaleFile").width() * 0.5);
    
    $("#modaleFile").find(".modal-body").html(`<div style="text-align: center;" class="bill-proof-container"><img width=${imgWidth} src=${billUrl} alt="Bill" /></div>`)
    $("#modaleFile").modal("show");
  }

  handleClickIconDownload = async (icon) => {
    const imageURL = icon.getAttribute("data-bill-url");
    console.log("Image URL:", imageURL);

    try {
      const response = await fetch(imageURL);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
  
      // Extract the file name from the URL and ensure it ends with .jpg
      let fileName = imageURL.split("/").pop().split("#")[0].split("?")[0];
  
      if (!fileName.includes('.')) {
        fileName += ".jpg";
      }  
      link.download = fileName;
  
      // Simulates a click on the link to trigger the download
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      console.log("Download triggered");
    } catch (error) {
      console.error("Failed to download image:", error);
    }
  }

  getBills = () => {
    if (this.store) {
      return this.store
      .bills()
      .list()
      .then(snapshot => {
        const bills = snapshot
          .map(doc => {
            try {
              return {
                ...doc,
                date: formatDate(doc.date),
                status: formatStatus(doc.status)
              }
            } catch(e) {
              // if for some reason, corrupted data was introduced, we manage here failing formatDate function
              // log the error and return unformatted date in that case
              console.log(e,"for",doc)
              return {
                ...doc,
                date: doc.date,
                status: formatStatus(doc.status)
              }
            }
          })
          console.log("length", bills.length)
        return bills
      })
    }
  }
}
