import { InMemoryUsersRepository } from "../../../users/repositories/in-memory/InMemoryUsersRepository";
import { AuthenticateUserUseCase } from "../../../users/useCases/authenticateUser/AuthenticateUserUseCase";
import { CreateUserUseCase } from "../../../users/useCases/createUser/CreateUserUseCase";
import { InMemoryStatementsRepository } from "../../repositories/in-memory/InMemoryStatementsRepository";
import { GetBalanceUseCase } from "../getBalance/GetBalanceUseCase";
import { CreateStatementError } from "./CreateStatementError";
import { CreateStatementUseCase } from "./CreateStatementUseCase";
import { ICreateStatementDTO } from "./ICreateStatementDTO";

let inMemoryUsersRepository: InMemoryUsersRepository;
let inMemoryStatementsRepository: InMemoryStatementsRepository;
let createStatementUseCase: CreateStatementUseCase;
let authenticateUserUseCase: AuthenticateUserUseCase;
let createUserUseCase: CreateUserUseCase;
let getBalanceUseCase: GetBalanceUseCase;


enum OperationType {
  DEPOSIT = 'deposit',
  WITHDRAW = 'withdraw',
}

describe("Create a statement", () => {
  beforeEach(() => {
    inMemoryUsersRepository = new InMemoryUsersRepository();
    inMemoryStatementsRepository = new InMemoryStatementsRepository();
    createStatementUseCase = new CreateStatementUseCase(
      inMemoryUsersRepository,
      inMemoryStatementsRepository,
    );
    authenticateUserUseCase = new AuthenticateUserUseCase(
      inMemoryUsersRepository,
    );
    createUserUseCase = new CreateUserUseCase(
      inMemoryUsersRepository,
    );
    getBalanceUseCase = new GetBalanceUseCase(
      inMemoryStatementsRepository,
      inMemoryUsersRepository,
    );
  });

  it("should be able to create a new deposit statement", async () => {
    const { email } = await createUserUseCase.execute({
      name: "rebs",
      email: "rebs@gmail.com",
      password: "123",
    });

    const { user: { id } } = await authenticateUserUseCase.execute({
      email,
      password: "123",
    });

    const depositStatement: ICreateStatementDTO = {
      user_id: id as string,
      description: "deposit description",
      amount: 10,
      type: OperationType.DEPOSIT,
    }

    const statement = await createStatementUseCase.execute(depositStatement);

    const { balance } = await getBalanceUseCase.execute({
      user_id: id as string,
    });

    expect(statement).toHaveProperty("id");
    expect(balance).toBe(10);
  });

  it("should be able to create a new withdraw statement", async () => {
    const { email } = await createUserUseCase.execute({
      name: "rebs",
      email: "rebs@gmail.com",
      password: "123",
    });

    const { user: { id } } = await authenticateUserUseCase.execute({
      email,
      password: "123",
    });

    const depositStatement: ICreateStatementDTO = {
      user_id: id as string,
      description: "deposit description",
      amount: 10,
      type: OperationType.DEPOSIT,
    }

    const withdrawStatement: ICreateStatementDTO = {
      user_id: id as string,
      description: "withdraw description",
      amount: 5,
      type: OperationType.WITHDRAW,
    }

    await createStatementUseCase.execute(depositStatement);

    const statement = await createStatementUseCase.execute(withdrawStatement);

    const { balance } = await getBalanceUseCase.execute({
      user_id: id as string,
    });

    expect(statement).toHaveProperty("id");
    expect(balance).toBe(5);
  });

  it("should not be able to create a new statement with non-existent user", async () => {
    expect(async () => {
      const depositStatement: ICreateStatementDTO = {
        user_id: "nonexistentUser",
        description: "deposit description",
        amount: 10,
        type: OperationType.DEPOSIT,
      }

      await createStatementUseCase.execute(depositStatement);
    }).rejects.toBeInstanceOf(CreateStatementError.UserNotFound);
  });

  it("should not be able to create a new withdraw statement with insufficient funds", async () => {
    expect(async () => {
      const { email } = await createUserUseCase.execute({
        name: "rebs",
        email: "rebs@gmail.com",
        password: "123",
      });

      const { user: { id } } = await authenticateUserUseCase.execute({
        email,
        password: "123",
      });

      const withdrawStatement: ICreateStatementDTO = {
        user_id: id as string,
        description: "withdraw description",
        amount: 10,
        type: OperationType.WITHDRAW,
      }

      await createStatementUseCase.execute(withdrawStatement);
    }).rejects.toBeInstanceOf(CreateStatementError.InsufficientFunds);
  });
});
