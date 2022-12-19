import { InMemoryUsersRepository } from "../../repositories/in-memory/InMemoryUsersRepository";
import { CreateUserError } from "./CreateUserError";
import { CreateUserUseCase } from "./CreateUserUseCase";
import { ICreateUserDTO } from "./ICreateUserDTO";


let inMemoryUsersRepository: InMemoryUsersRepository;
let createUserUseCase: CreateUserUseCase;

describe("Create User", () => {
  beforeEach(() => {
    inMemoryUsersRepository = new InMemoryUsersRepository();
    createUserUseCase = new CreateUserUseCase(
      inMemoryUsersRepository
    );
  });

  it("shoud be able to create a new user", async () => {
    const user: ICreateUserDTO = {
      name: "User test",
      email: "test@finapi.com",
      password: "1234",
    }

    const createdUser = await createUserUseCase.execute(user);

    expect(createdUser).toHaveProperty("id");
  });

  it("shoud not be able to create a new user with an existing email", () => {
    expect(async () => {
      const user: ICreateUserDTO = {
        name: "User test",
        email: "test@finapi.com",
        password: "1234",
      }

      await createUserUseCase.execute(user);
      await createUserUseCase.execute(user);

    }).rejects.toBeInstanceOf(CreateUserError);
  });
});
