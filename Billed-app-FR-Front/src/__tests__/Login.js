/**
 * @jest-environment jsdom
 */

import { fireEvent, screen } from "@testing-library/dom";

import LoginUI from "../views/LoginUI.js";
import Login from "../containers/Login.js";

import { ROUTES } from "../constants/routes";

/**
 * Employee
 */
describe("Given that I am a user on login page", () => {
  describe("When I do not fill fields and I click on employee button Login In", () => {
    test("Then It should renders Login page", () => {
      document.body.innerHTML = LoginUI();

      const inputEmailUser = screen.getByTestId("employee-email-input");
      expect(inputEmailUser.value).toBe("");

      const inputPasswordUser = screen.getByTestId("employee-password-input");
      expect(inputPasswordUser.value).toBe("");

      const form = screen.getByTestId("form-employee");
      const handleSubmit = jest.fn((e) => e.preventDefault());

      form.addEventListener("submit", handleSubmit);
      fireEvent.submit(form);
      expect(screen.getByTestId("form-employee")).toBeTruthy();
    });
  });

  describe("When I do fill fields in incorrect format and I click on employee button Login In", () => {
    test("Then It should renders Login page", () => {
      document.body.innerHTML = LoginUI();

      const inputEmailUser = screen.getByTestId("employee-email-input");
      fireEvent.change(inputEmailUser, { target: { value: "pasunemail" } });
      expect(inputEmailUser.value).toBe("pasunemail");

      const inputPasswordUser = screen.getByTestId("employee-password-input");
      fireEvent.change(inputPasswordUser, { target: { value: "azerty" } });
      expect(inputPasswordUser.value).toBe("azerty");

      const form = screen.getByTestId("form-employee");
      const handleSubmit = jest.fn((e) => e.preventDefault());

      form.addEventListener("submit", handleSubmit);
      fireEvent.submit(form);
      expect(screen.getByTestId("form-employee")).toBeTruthy();
    });
  });

  describe("When I do fill fields in correct format and I click on employee button Login In", () => {
    test("Then I should be identified as an Employee in app", () => {
      document.body.innerHTML = LoginUI();
      const inputData = {
        email: "johndoe@email.com",
        password: "azerty",
      };

      const inputEmailUser = screen.getByTestId("employee-email-input");
      fireEvent.change(inputEmailUser, { target: { value: inputData.email } });
      expect(inputEmailUser.value).toBe(inputData.email);

      const inputPasswordUser = screen.getByTestId("employee-password-input");
      fireEvent.change(inputPasswordUser, {
        target: { value: inputData.password },
      });
      expect(inputPasswordUser.value).toBe(inputData.password);

      const form = screen.getByTestId("form-employee");

      // localStorage should be populated with form data
      Object.defineProperty(window, "localStorage", {
        value: {
          getItem: jest.fn(() => null),
          setItem: jest.fn(() => null),
        },
        writable: true,
      });

      // we have to mock navigation to test it
      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname });
      };

      let PREVIOUS_LOCATION = "";

      const store = jest.fn();

      const login = new Login({
        document,
        localStorage: window.localStorage,
        onNavigate,
        PREVIOUS_LOCATION,
        store,
      });

      const handleSubmit = jest.fn(login.handleSubmitEmployee);
      login.login = jest.fn().mockResolvedValue({});
      form.addEventListener("submit", handleSubmit);
      fireEvent.submit(form);
      expect(handleSubmit).toHaveBeenCalled();

      expect(window.localStorage.setItem).toHaveBeenCalled();
      expect(window.localStorage.setItem).toHaveBeenCalledWith(
        "user",
        JSON.stringify({
          type: "Employee",
          email: inputData.email,
          password: inputData.password,
          status: "connected",
        })
      );
    });

    test("It should renders Bills page", () => {
      expect(screen.getAllByText("Mes notes de frais")).toBeTruthy();
    });
  });
});

/**
 * Admin
 */
describe("Given that I am a user on login page", () => {
  describe("When I do not fill fields and I click on admin button Login In", () => {
    test("Then It should renders Login page", () => {
      document.body.innerHTML = LoginUI();

      const inputEmailUser = screen.getByTestId("admin-email-input");
      expect(inputEmailUser.value).toBe("");

      const inputPasswordUser = screen.getByTestId("admin-password-input");
      expect(inputPasswordUser.value).toBe("");

      const form = screen.getByTestId("form-admin");
      const handleSubmit = jest.fn((e) => e.preventDefault());

      form.addEventListener("submit", handleSubmit);
      fireEvent.submit(form);
      expect(screen.getByTestId("form-admin")).toBeTruthy();
    });
  });

  describe("When I do fill fields in incorrect format and I click on admin button Login In", () => {
    test("Then it should renders Login page", () => {
      document.body.innerHTML = LoginUI();

      const inputEmailUser = screen.getByTestId("admin-email-input");
      fireEvent.change(inputEmailUser, { target: { value: "pasunemail" } });
      expect(inputEmailUser.value).toBe("pasunemail");

      const inputPasswordUser = screen.getByTestId("admin-password-input");
      fireEvent.change(inputPasswordUser, { target: { value: "azerty" } });
      expect(inputPasswordUser.value).toBe("azerty");

      const form = screen.getByTestId("form-admin");
      const handleSubmit = jest.fn((e) => e.preventDefault());

      form.addEventListener("submit", handleSubmit);
      fireEvent.submit(form);
      expect(screen.getByTestId("form-admin")).toBeTruthy();
    });
  });

  describe("When I do fill fields in correct format and I click on admin button Login In", () => {
    test("Then I should be identified as an HR admin in app", () => {
      document.body.innerHTML = LoginUI();
      const inputData = {
        type: "Admin",
        email: "johndoe@email.com",
        password: "azerty",
        status: "connected",
      };

      const inputEmailUser = screen.getByTestId("admin-email-input");
      fireEvent.change(inputEmailUser, { target: { value: inputData.email } });
      expect(inputEmailUser.value).toBe(inputData.email);

      const inputPasswordUser = screen.getByTestId("admin-password-input");
      fireEvent.change(inputPasswordUser, {
        target: { value: inputData.password },
      });
      expect(inputPasswordUser.value).toBe(inputData.password);

      const form = screen.getByTestId("form-admin");

      // localStorage should be populated with form data
      Object.defineProperty(window, "localStorage", {
        value: {
          getItem: jest.fn(() => null),
          setItem: jest.fn(() => null),
        },
        writable: true,
      });

      // we have to mock navigation to test it
      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname });
      };

      let PREVIOUS_LOCATION = "";

      const store = jest.fn();

      const login = new Login({
        document,
        localStorage: window.localStorage,
        onNavigate,
        PREVIOUS_LOCATION,
        store,
      });

      const handleSubmit = jest.fn(login.handleSubmitAdmin);
      login.login = jest.fn().mockResolvedValue({});
      form.addEventListener("submit", handleSubmit);
      fireEvent.submit(form);
      expect(handleSubmit).toHaveBeenCalled();
      expect(window.localStorage.setItem).toHaveBeenCalled();
      expect(window.localStorage.setItem).toHaveBeenCalledWith(
        "user",
        JSON.stringify({
          type: "Admin",
          email: inputData.email,
          password: inputData.password,
          status: "connected",
        })
      );
    });

    test("It should renders HR dashboard page", () => {
      expect(screen.queryByText("Validations")).toBeTruthy();
    });
  });
});

/**
 * Catch
 */
describe("When Handling Errors in Login", () => {

  test("Then Handle error in login for Employee", async () => {
    document.body.innerHTML = LoginUI();
    const inputData = {
      email: "johndoe@email.com",
      password: "azerty",
    };

    const inputEmailUser = screen.getByTestId("employee-email-input");
    fireEvent.change(inputEmailUser, { target: { value: inputData.email } });
    expect(inputEmailUser.value).toBe(inputData.email);

    const inputPasswordUser = screen.getByTestId("employee-password-input");
    fireEvent.change(inputPasswordUser, {
      target: { value: inputData.password },
    });
    expect(inputPasswordUser.value).toBe(inputData.password);

    const form = screen.getByTestId("form-employee");

    // Mock localStorage
    Object.defineProperty(window, "localStorage", {
      value: {
        getItem: jest.fn(() => null),
        setItem: jest.fn(() => null),
      },
      writable: true,
    });

    const onNavigate = (pathname) => {
      document.body.innerHTML = ROUTES({ pathname });
    };
    let PREVIOUS_LOCATION = "";

    // Create a mock login function that rejects the promise
    const mockLogin = jest.fn().mockRejectedValue(new Error("Login failed"));

    // Create a mock createUser function
    const mockCreateUser = jest.fn().mockResolvedValue({});

    // Instantiate the Login object
    const login = new Login({
      document,
      localStorage: window.localStorage,
      onNavigate,
      PREVIOUS_LOCATION,
      store: null,
    });

    // Replace login and createUser methods with mocks
    login.login = mockLogin;
    login.createUser = mockCreateUser;

    const handleSubmit = jest.fn(login.handleSubmitEmployee);
    form.addEventListener("submit", handleSubmit);
    fireEvent.submit(form);
    await new Promise(process.nextTick);
    expect(handleSubmit).toHaveBeenCalled();

    // Ensure createUser was called in case of error
    expect(mockCreateUser).toHaveBeenCalledWith({
      type: "Employee",
      email: inputData.email,
      password: inputData.password,
      status: "connected",
    });

    // Optionally, you can check that onNavigate was called with the correct path
    // expect(onNavigate).toHaveBeenCalledWith(ROUTES_PATH['Bills']);
  });

  test("Then it should renders the Bills page", () => {
    expect(screen.queryByText("Mes notes de frais")).toBeTruthy();
  });


  test("Then Handle error in login for Admin", async () => {
    document.body.innerHTML = LoginUI();
    const inputData = {
      email: "johndoe@email.com",
      password: "azerty",
    };

    const inputEmailUser = screen.getByTestId("admin-email-input");
    fireEvent.change(inputEmailUser, { target: { value: inputData.email } });
    expect(inputEmailUser.value).toBe(inputData.email);

    const inputPasswordUser = screen.getByTestId("admin-password-input");
    fireEvent.change(inputPasswordUser, {
      target: { value: inputData.password },
    });
    expect(inputPasswordUser.value).toBe(inputData.password);

    const form = screen.getByTestId("form-admin");

    // Mock localStorage
    Object.defineProperty(window, "localStorage", {
      value: {
        getItem: jest.fn(() => null),
        setItem: jest.fn(() => null),
      },
      writable: true,
    });

    const onNavigate = (pathname) => {
      document.body.innerHTML = ROUTES({ pathname });
    };
    let PREVIOUS_LOCATION = "";

    // Create a mock login function that rejects the promise
    const mockLogin = jest.fn().mockRejectedValue(new Error("Login failed"));

    // Create a mock createUser function
    const mockCreateUser = jest.fn().mockResolvedValue({});

    // Instantiate the Login object
    const login = new Login({
      document,
      localStorage: window.localStorage,
      onNavigate,
      PREVIOUS_LOCATION,
      store: null,
    });

    // Replace login and createUser methods with mocks
    login.login = mockLogin;
    login.createUser = mockCreateUser;

    const handleSubmit = jest.fn(login.handleSubmitAdmin);
    form.addEventListener("submit", handleSubmit);
    fireEvent.submit(form);
    await new Promise(process.nextTick);
    expect(handleSubmit).toHaveBeenCalled();

    // Ensure createUser was called in case of error
    expect(mockCreateUser).toHaveBeenCalledWith({
      type: "Admin",
      email: inputData.email,
      password: inputData.password,
      status: "connected",
    });

  });

  test("Then it should renders the Dashboard page", () => {
    expect(screen.queryByText("Validations")).toBeTruthy();
  });

});