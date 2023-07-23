function timer(deliveryTime, action, item) {
  let timeLeft = deliveryTime;
  const timer = setInterval(() => {
    if (timeLeft <= 0) {
      clearInterval(timer);
      action();
    } else {
      console.log(timeLeft);

      timeLeft--;
    }
  }, 500);
}

// timer(deliveryTime, () => {
//   console.log('finished');
// });

module.exports = { timer };
