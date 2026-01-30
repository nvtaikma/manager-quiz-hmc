import fs from "fs";
import path from "path";

interface Account {
  id: string;
  username: string;
  password: string;
  email: string;
  role: string;
  active: boolean;
  createdAt: string;
  lastLogin: string | null;
}

interface AccountsData {
  accounts: Account[];
}

// Interface cho user data công khai (không có password)
export interface PublicUserData {
  id: string;
  username: string;
  email: string;
  role: string;
  active: boolean;
  createdAt: string;
  lastLogin: string | null;
}

// Đường dẫn đến file accounts.json
const ACCOUNTS_FILE_PATH = path.join(process.cwd(), "src/data/accounts.json");

// Đọc danh sách accounts từ file JSON
export function getAccounts(): Account[] {
  try {
    const fileContent = fs.readFileSync(ACCOUNTS_FILE_PATH, "utf-8");
    const data: AccountsData = JSON.parse(fileContent);
    return data.accounts;
  } catch (error) {
    console.error("Lỗi khi đọc file accounts:", error);
    return [];
  }
}

// Tìm account theo username
export function findAccountByUsername(username: string): Account | null {
  const accounts = getAccounts();
  return accounts.find((account) => account.username === username) || null;
}

// Xác thực tài khoản
export function authenticateUser(
  username: string,
  inputPassword: string
): { success: boolean; account?: PublicUserData; message?: string } {
  try {
    const account = findAccountByUsername(username);

    if (!account) {
      return {
        success: false,
        message: "Tài khoản không tồn tại!",
      };
    }

    if (!account.active) {
      return {
        success: false,
        message: "Tài khoản đã bị vô hiệu hóa!",
      };
    }

    if (account.password !== inputPassword) {
      return {
        success: false,
        message: "Mật khẩu không chính xác!",
      };
    }

    // Cập nhật thời gian đăng nhập cuối
    updateLastLogin(account.id);

    // Tạo object user không có password để trả về
    const { password: _, ...userWithoutPassword } = account;

    return {
      success: true,
      account: userWithoutPassword as PublicUserData,
    };
  } catch (error) {
    console.error("Lỗi xác thực:", error);
    return {
      success: false,
      message: "Đã xảy ra lỗi trong quá trình xác thực!",
    };
  }
}

// Cập nhật thời gian đăng nhập cuối
export function updateLastLogin(accountId: string): boolean {
  try {
    const accounts = getAccounts();
    const accountIndex = accounts.findIndex((acc) => acc.id === accountId);

    if (accountIndex === -1) {
      return false;
    }

    accounts[accountIndex].lastLogin = new Date().toISOString();

    const data: AccountsData = { accounts };
    fs.writeFileSync(
      ACCOUNTS_FILE_PATH,
      JSON.stringify(data, null, 2),
      "utf-8"
    );

    return true;
  } catch (error) {
    console.error("Lỗi cập nhật lastLogin:", error);
    return false;
  }
}

// Thêm account mới
export function addAccount(
  newAccount: Omit<Account, "id" | "createdAt" | "lastLogin">
): boolean {
  try {
    const accounts = getAccounts();

    // Kiểm tra username đã tồn tại chưa
    if (accounts.some((acc) => acc.username === newAccount.username)) {
      return false;
    }

    const account: Account = {
      ...newAccount,
      id: (accounts.length + 1).toString(),
      createdAt: new Date().toISOString(),
      lastLogin: null,
    };

    accounts.push(account);

    const data: AccountsData = { accounts };
    fs.writeFileSync(
      ACCOUNTS_FILE_PATH,
      JSON.stringify(data, null, 2),
      "utf-8"
    );

    return true;
  } catch (error) {
    console.error("Lỗi thêm account:", error);
    return false;
  }
}

// Cập nhật trạng thái account
export function updateAccountStatus(
  accountId: string,
  active: boolean
): boolean {
  try {
    const accounts = getAccounts();
    const accountIndex = accounts.findIndex((acc) => acc.id === accountId);

    if (accountIndex === -1) {
      return false;
    }

    accounts[accountIndex].active = active;

    const data: AccountsData = { accounts };
    fs.writeFileSync(
      ACCOUNTS_FILE_PATH,
      JSON.stringify(data, null, 2),
      "utf-8"
    );

    return true;
  } catch (error) {
    console.error("Lỗi cập nhật trạng thái account:", error);
    return false;
  }
}

// Cập nhật mật khẩu account
export function updateAccountPassword(
  accountId: string,
  newPassword: string
): boolean {
  try {
    console.log("🔄 Starting password update for account ID:", accountId);

    const accounts = getAccounts();
    console.log("📄 Total accounts found:", accounts.length);

    const accountIndex = accounts.findIndex((acc) => acc.id === accountId);

    if (accountIndex === -1) {
      console.error("❌ Account not found with ID:", accountId);
      console.log(
        "Available account IDs:",
        accounts.map((acc) => acc.id)
      );
      return false;
    }

    console.log("✅ Account found at index:", accountIndex);
    console.log(
      "👤 Updating password for username:",
      accounts[accountIndex].username
    );

    // Backup old password for rollback if needed
    const oldPassword = accounts[accountIndex].password;
    accounts[accountIndex].password = newPassword;

    const data: AccountsData = { accounts };

    try {
      fs.writeFileSync(
        ACCOUNTS_FILE_PATH,
        JSON.stringify(data, null, 2),
        "utf-8"
      );
      console.log("✅ Password successfully written to file");
    } catch (writeError) {
      console.error("❌ Failed to write to file:", writeError);
      // Rollback
      accounts[accountIndex].password = oldPassword;
      throw writeError;
    }

    return true;
  } catch (error) {
    console.error("❌ Error updating account password:", error);

    if (error instanceof Error) {
      console.error("Error details:", {
        name: error.name,
        message: error.message,
        stack: error.stack,
      });
    }

    return false;
  }
}
