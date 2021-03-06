import { Container } from "inversify";
import getDecorators from "inversify-inject-decorators";
import "reflect-metadata";
import LoginState from "@/states/login.state";
import UserState from "@/states/user.state";
import TagState from "@/states/tag.state";
import CategoryState from "@/states/category.state";
import ArticleState from "@/states/article.state";
import ImageState from "@/states/image.state";
import GeographicState from "@/states/geographic.state";



const container: Container = new Container();
container.bind<LoginState>("LoginState").to(LoginState);
container.bind<UserState>("UserState").to(UserState);
container.bind<TagState>("TagState").to(TagState);
container.bind<CategoryState>("CategoryState").to(CategoryState);
container.bind<ArticleState>("ArticleState").to(ArticleState);
container.bind<ImageState>("ImageState").to(ImageState);
container.bind<GeographicState>("GeographicState").to(GeographicState);
export const { lazyInject } = getDecorators(container);
export { container };
