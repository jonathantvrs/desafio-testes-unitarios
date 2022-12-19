import { InMemoryUsersRepository } from "../../repositories/in-memory/InMemoryUsersRepository";
import { AuthenticateUserUseCase } from "../authenticateUser/AuthenticateUserUseCase";
import { CreateUserUseCase } from "../createUser/CreateUserUseCase";
import { ICreateUserDTO } from "../createUser/ICreateUserDTO";
import { ShowUserProfileError } from "./ShowUserProfileError";
import { ShowUserProfileUseCase } from "./ShowUserProfileUseCase";

let inMemoryUsersRepository: InMemoryUsersRepository;
let showUserProfileUseCase: ShowUserProfileUseCase;
let authenticateUserUseCase: AuthenticateUserUseCase;
let createUserUseCase: CreateUserUseCase;

describe("Get User Info", () => {
  beforeEach(() => {
    inMemoryUsersRepository = new InMemoryUsersRepository();
    showUserProfileUseCase = new ShowUserProfileUseCase(
      inMemoryUsersRepository
    );
    authenticateUserUseCase = new AuthenticateUserUseCase(
      inMemoryUsersRepository
    );
    createUserUseCase = new CreateUserUseCase(
      inMemoryUsersRepository
    );
  });

  it("should be able to get authenticated user info", async () => {
    const newUser: ICreateUserDTO = {
      name: "Rebs",
      email: "rebs@gmail.com",
      password: "12345",
    };

    await createUserUseCase.execute(newUser);

    const { user: { id } } = await authenticateUserUseCase.execute({
      email: "rebs@gmail.com",
      password: "12345",
    });

    const result = await showUserProfileUseCase.execute(id as string);

    expect(result.name).toEqual("Rebs");
  });

  it("should not be able to get user info with incorrect id", () => {
    expect(async () => {
      await showUserProfileUseCase.execute("123");
    }).rejects.toBeInstanceOf(ShowUserProfileError);
  });
});
