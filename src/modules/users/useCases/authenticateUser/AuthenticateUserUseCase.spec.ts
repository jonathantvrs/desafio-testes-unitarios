import { InMemoryUsersRepository } from "../../repositories/in-memory/InMemoryUsersRepository";
import { CreateUserUseCase } from "../createUser/CreateUserUseCase";
import { ICreateUserDTO } from "../createUser/ICreateUserDTO";
import { AuthenticateUserUseCase } from "./AuthenticateUserUseCase";
import { IncorrectEmailOrPasswordError } from "./IncorrectEmailOrPasswordError";

let inMemoryUsersRepository: InMemoryUsersRepository;
let createUserUseCase: CreateUserUseCase;
let authenticateUserUseCase: AuthenticateUserUseCase;

describe("Authenticate user", () => {
  beforeEach(() => {
    inMemoryUsersRepository = new InMemoryUsersRepository();
    createUserUseCase = new CreateUserUseCase(inMemoryUsersRepository);
    authenticateUserUseCase = new AuthenticateUserUseCase(
      inMemoryUsersRepository
    );
  });

  it("shoud be able to authenticate user", async () => {
    const user: ICreateUserDTO = {
      name: "rebs",
      email: "rebsnogueira@gmail.com",
      password: "rebs",
    };

    await createUserUseCase.execute(user);

    const result = await authenticateUserUseCase.execute({
      email: user.email,
      password: user.password,
    });

    expect(result).toHaveProperty("token")
  });

  it("shoud not be able to authenticate an non-existent user", () => {
    expect(async () => {
      const user: ICreateUserDTO = {
        name: "rebs",
        email: "rebs@gmail.com",
        password: "rebs",
      };

      await createUserUseCase.execute(user);

      await authenticateUserUseCase.execute({
        email: "fake@gmail.com",
        password: user.password,
      });
    }).rejects.toBeInstanceOf(IncorrectEmailOrPasswordError);
  });

  it("shoud not be able to authenticate user with incorrect password", () => {
    expect(async () => {
      const user: ICreateUserDTO = {
        name: "rebs",
        email: "rebs@gmail.com",
        password: "rebs",
      };

      await createUserUseCase.execute(user);

      await authenticateUserUseCase.execute({
        email: user.email,
        password: "incorrectPassword",
      });
    }).rejects.toBeInstanceOf(IncorrectEmailOrPasswordError);
  });
});
