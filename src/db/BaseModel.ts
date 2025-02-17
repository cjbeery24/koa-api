import { Model } from "sequelize-typescript";

export default abstract class BaseModel extends Model {
  hidden: string[] = [];
  toJSON() {
    const values = Object.assign({}, this.get());
    this.hidden.forEach((hiddenProperty) => {
      if (values[hiddenProperty]) {
        delete values[hiddenProperty];
      }
    });
    return values;
  }
}
