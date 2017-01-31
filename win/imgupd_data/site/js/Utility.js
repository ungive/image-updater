// Simple vector class.
function Vector(x, y) {
  this.set = function (x, y) {
    this.x = x;
    this.y = y;
  };
  this.set(x || 0, y || 0);
  this.add = function (vector) {
    this.x += vector.x;
    this.y += vector.y;
    return this;
  };
}

// Shorter syntax for defining a property.
Object.prototype.define = function (property, descriptor) {
  Object.defineProperty(this, property, descriptor);
};
