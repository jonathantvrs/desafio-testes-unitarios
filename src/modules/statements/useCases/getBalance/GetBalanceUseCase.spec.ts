import { InMemoryUsersRepository } from "../../../users/repositories/in-memory/InMemoryUsersRepository";
import { ICreateUserDTO } from "../../../users/useCases/createUser/ICreateUserDTO";
import { InMemoryStatementsRepository } from "../../repositories/in-memory/InMemoryStatementsRepository";
import { GetBalanceError } from "./GetBalanceError";
import { GetBalanceUseCase } from "./GetBalanceUseCase";

let inMemoryStatementsRepository: InMemoryStatementsRepository;
let inMemoryUsersRepository: InMemoryUsersRepository;
let getBalanceUseCase: GetBalanceUseCase;

describe("Get balance from user", () => {
  beforeEach(() => {
    inMemoryStatementsRepository = new InMemoryStatementsRepository();
    inMemoryUsersRepository = new InMemoryUsersRepository();
    getBalanceUseCase = new GetBalanceUseCase(
      inMemoryStatementsRepository,
      inMemoryUsersRepository,
    );
  })

  it("shoud be able to get a user's balance", async () => {
    const user: ICreateUserDTO = {
      name: "Rebs",
      email: "rebs@gmail.com",
      password: "12345",
    };

    const userCreated = await inMemoryUsersRepository.create(user);

    const user_id = userCreated.id as string;

    const response = await getBalanceUseCase.execute({ user_id });

    expect(response.balance).toBe(0);
    expect(response.statement.length).toBe(0);
  });

  it("shoud not be able to get the balance of a user not found", () => {
    expect(async () => {
      await getBalanceUseCase.execute({ user_id: "12345" });
    }).rejects.toBeInstanceOf(GetBalanceError);
  });
});
