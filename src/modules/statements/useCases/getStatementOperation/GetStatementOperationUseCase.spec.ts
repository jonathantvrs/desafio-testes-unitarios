import { InMemoryUsersRepository } from "../../../users/repositories/in-memory/InMemoryUsersRepository";
import { AuthenticateUserUseCase } from "../../../users/useCases/authenticateUser/AuthenticateUserUseCase";
import { CreateUserUseCase } from "../../../users/useCases/createUser/CreateUserUseCase";
import { InMemoryStatementsRepository } from "../../repositories/in-memory/InMemoryStatementsRepository";
import { CreateStatementUseCase } from "../createStatement/CreateStatementUseCase";
import { GetStatementOperationError } from "./GetStatementOperationError";
import { GetStatementOperationUseCase } from "./GetStatementOperationUseCase";

let inMemoryUsersRepository: InMemoryUsersRepository;
let inMemoryStatementsRepository: InMemoryStatementsRepository;
let createStatementUseCase: CreateStatementUseCase;
let getStatementOperationUseCase: GetStatementOperationUseCase;
let createUserUseCase: CreateUserUseCase;
let authenticateUserUseCase: AuthenticateUserUseCase;

enum OperationType {
  DEPOSIT = 'deposit',
  WITHDRAW = 'withdraw'
}

describe("Get statement operation detail", () => {
  beforeEach(() => {
    inMemoryUsersRepository = new InMemoryUsersRepository();
    inMemoryStatementsRepository = new InMemoryStatementsRepository();
    createStatementUseCase = new CreateStatementUseCase(
      inMemoryUsersRepository,
      inMemoryStatementsRepository,
    );
    getStatementOperationUseCase = new GetStatementOperationUseCase(
      inMemoryUsersRepository,
      inMemoryStatementsRepository,
    );
    createUserUseCase = new CreateUserUseCase(inMemoryUsersRepository);
    authenticateUserUseCase = new AuthenticateUserUseCase(inMemoryUsersRepository);
  });

  it("should be able to detail statement operation", async () => {
    const { email } = await createUserUseCase.execute({
      name: "rebs",
      email: "rebs@gmail.com",
      password: "123",
    });

    const { user: { id } } = await authenticateUserUseCase.execute({
      email,
      password: "123",
    });

    const { id: statement_id } = await createStatementUseCase.execute({
      user_id: id as string,
      description: "deposit description",
      amount: 10,
      type: OperationType.DEPOSIT,
    });

    const statement = await getStatementOperationUseCase.execute({
      user_id: id as string,
      statement_id: statement_id as string,
    });

    expect(statement.description).toEqual("deposit description");
    expect(statement.amount).toBe(10);
    expect(statement.type).toEqual(OperationType.DEPOSIT);
  });

  it("should not be able to detail statement operation from non-existent user", () => {
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

      const { id: statement_id } = await createStatementUseCase.execute({
        user_id: id as string,
        description: "deposit description",
        amount: 10,
        type: OperationType.DEPOSIT,
      });

      await getStatementOperationUseCase.execute({
        user_id: "123",
        statement_id: statement_id as string,
      });
    }).rejects.toBeInstanceOf(GetStatementOperationError.UserNotFound);
  });

  it("should not be able to detail non-existent statement operation", () => {
    expect(async () => {
      const user = await createUserUseCase.execute({
        name: "rebs",
        email: "rebs@gmail.com",
        password: "12345",
      });

      const { user: { id } } = await authenticateUserUseCase.execute({
        email: user.email,
        password: "12345",
      });

      await getStatementOperationUseCase.execute({
        user_id: id as string,
        statement_id: "statementIncorrect",
      });
    }).rejects.toBeInstanceOf(GetStatementOperationError.StatementNotFound);
  });
});
