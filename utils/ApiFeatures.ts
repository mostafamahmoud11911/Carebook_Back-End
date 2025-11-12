import { FindOptions, Op } from "sequelize";

export default class ApiFeatures {
  sequelizeQuery: FindOptions;
  queryParams: Record<string, any>;

  constructor(sequelizeQuery: FindOptions, queryParams: Record<string, any>) {
    this.sequelizeQuery = sequelizeQuery;
    this.queryParams = queryParams;
  }

  searchQuery(fieldName: string = "name") {
    let { search } = this.queryParams;
    if (search) {
      this.sequelizeQuery.where = {
        ...this.sequelizeQuery.where,
        [fieldName]: { [Op.like]: `%${this.queryParams.search}%` },
      };
    }

    return this;
  }

  filterQuery() {
    const operatorMap: Record<string, symbol> = {
      eq: Op.eq,
      ne: Op.ne,
      gt: Op.gt,
      gte: Op.gte,
      lt: Op.lt,
      lte: Op.lte,
      like: Op.like,
      between: Op.between,
      in: Op.in,
    };

    const buildWhere = (query: any) => {
      const where: any = {};

      delete query.page;
      delete query.limit;
      delete query.search;
      delete query.sort;

      // query => { 'price[between]': '100,400' }
      for (const key in query) {
        // key =>  price[between]
        const match = key.match(/(\w+)\[(\w+)\]/);

        if (match) {
          const field = match[1]; // like price, rate, duration ...
          const op = match[2]; // like (lt, lte, gt, gte...)

          if (!where[field]) where[field] = {};
          //{price: {}}
          const sequelizeOp = operatorMap[op];
          // like => Op.lt
          if (sequelizeOp) {
            where[field][sequelizeOp] = query[key];
            // {price: {[Op.lt]: 200}}
          }
          if (op === "between" || op === "in") {
            where[field][sequelizeOp] = query[key].split(","); // 100,200 => [100,200]
          }
        } else {
          where[key] = query[key];
        }
      }

      return where;
    };

    const where = buildWhere(this.queryParams);

    this.sequelizeQuery.where = {
      ...this.sequelizeQuery.where,
      ...where,
    };

    return this;
  }

}
