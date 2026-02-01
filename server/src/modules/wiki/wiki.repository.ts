import { AppDataSource } from "../../config/ormconfig";
import { WikiPage } from "./wiki.entity";

export const WikiRepository = AppDataSource.getRepository(WikiPage);
