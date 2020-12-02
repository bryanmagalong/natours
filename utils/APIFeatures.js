/* eslint-disable prettier/prettier */
class APIFeatures {
  constructor(query, queryString) {
    this.query = query; // Tour.find()
    this.queryString = queryString; // req.query
  }

  filter() {
    //===== FILTERING
    const queryObj = { ...this.queryString }; // we copy the query obj
    const excludedFields = [ 'page', 'sort', 'limit', 'fields' ];
    excludedFields.forEach((el) => delete queryObj[el]); // will delete in queryObj all matching fields

    //===== ADVANCED FILTERING
    let queryStr = JSON.stringify(queryObj);
    queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`);

    this.query = this.query.find(JSON.parse(queryStr));

    return this; // will return the entire object, needed in order to chain with other methods
  }

  sort() {
    //===== SORTING
    if (this.queryString.sort) {
      const sortBy = this.queryString.sort.split(',').join(' '); // replace all ',' with ' '

      this.query = this.query.sort(sortBy);
    }
    else {
      // Default sort by descending creation date
      this.query = this.query.sort('-createdAt');
    }

    return this; // will return the entire object
  }

  limitFields() {
    //===== FIELD LIMITING
    if (this.queryString.fields) {
      const fields = this.queryString.fields.split(',').join(' ');
      this.query = this.query.select(fields); // query.select('name duration price')
    }
    else {
      this.query = this.query.select('-__v'); // will exclude the '__v' field
    }

    return this;
  }

  paginate() {
    //===== PAGINATION
    const page = this.queryString.page * 1 || 1; // simple String conversion to Number
    const limit = this.queryString.limit * 1 || 100;
    const skip = (page - 1) * limit;

    this.query = this.query.skip(skip).limit(limit);

    return this;
  }
}

module.exports = APIFeatures;
