(function () {
  const limit = 12000;
  const timer = document.createElement('div');
  timer.id = 'question-timer';
  timer.hidden = true;
  timer.setAttribute('role', 'timer');
  timer.setAttribute('aria-live', 'off');
  document.querySelector('.variant-toolbar').prepend(timer);
  const originalShow = showQuestion;
  const originalSelect = selectOption;
  const originalResult = showResult;
  let interval = null;
  let deadline = 0;
  function stop() {
    clearInterval(interval);
    interval = null;
  }
  function expire() {
    if (isAnswered) { stop(); return; }
    stop();
    timer.textContent = '00';
    timer.setAttribute('aria-label', 'Время вышло');
    timer.classList.add('timer-urgent');
    const q = quizData[currentQuestionIdx];
    const wrong = document.querySelector('.option-item[data-original-id="' + ((q.c + 1) % q.a.length) + '"]');
    originalSelect(wrong, Number(wrong.dataset.originalId), q);
    wrong.classList.remove('incorrect');
    const hint = document.querySelector('#feedback-container .hint-box');
    hint.classList.add('timeout-feedback');
    hint.querySelector('strong').textContent = 'Время вышло. Ответ не засчитан.';
  }
  function tick() {
    const remaining = Math.max(0, Math.ceil((deadline - Date.now()) / 1000));
    timer.textContent = String(remaining).padStart(2, '0');
    timer.setAttribute('aria-label', 'Осталось секунд: ' + remaining);
    timer.classList.toggle('timer-urgent', remaining <= 3);
    if (remaining === 0) expire();
  }
  showQuestion = function () {
    stop();
    originalShow();
    timer.hidden = false;
    deadline = Date.now() + limit;
    tick();
    interval = setInterval(tick, 100);
  };
  selectOption = function (element, selectedId, qData) {
    if (isAnswered) return;
    if (Date.now() >= deadline) { expire(); return; }
    stop();
    originalSelect(element, selectedId, qData);
  };
  showResult = function () {
    stop();
    timer.hidden = true;
    originalResult();
  };
})();
