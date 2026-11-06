import unittest
from core.sm2 import review_card, SM2State, AGAIN, HARD, GOOD, EASY


def new_card():
    return SM2State(ease_factor=2.5, interval_days=0, repetitions=0)


class SM2Tests(unittest.TestCase):

    def test_first_review_good_sets_interval_to_1(self):
        result = review_card(GOOD, new_card())
        self.assertEqual(result.interval_days, 1)
        self.assertEqual(result.repetitions, 1)

    def test_second_consecutive_good_sets_interval_to_6(self):
        state = review_card(GOOD, new_card())
        state = review_card(GOOD, state)
        self.assertEqual(state.interval_days, 6)
        self.assertEqual(state.repetitions, 2)

    def test_third_consecutive_good_multiplies_by_ease_factor(self):
        state = new_card()
        state = review_card(GOOD, state)
        state = review_card(GOOD, state)
        ef_before_third = state.ease_factor
        state = review_card(GOOD, state)
        self.assertEqual(state.interval_days, round(6 * ef_before_third))
        self.assertEqual(state.repetitions, 3)

    def test_again_resets_repetitions_and_interval(self):
        state = new_card()
        state = review_card(GOOD, state)
        state = review_card(GOOD, state)
        state = review_card(GOOD, state)
        state = review_card(AGAIN, state)
        self.assertEqual(state.repetitions, 0)
        self.assertEqual(state.interval_days, 1)

    def test_ease_factor_never_drops_below_1_3(self):
        state = new_card()
        for _ in range(20):
            state = review_card(AGAIN, state)
        self.assertGreaterEqual(state.ease_factor, 1.3)

    def test_easy_increases_ease_factor_more_than_good(self):
        good_result = review_card(GOOD, new_card())
        easy_result = review_card(EASY, new_card())
        self.assertGreater(easy_result.ease_factor, good_result.ease_factor)

    def test_hard_is_treated_as_a_pass_but_lowers_ease_factor(self):
        state = new_card()
        state = review_card(GOOD, state)
        state = review_card(GOOD, state)
        ef_before = state.ease_factor
        state = review_card(HARD, state)
        self.assertEqual(state.repetitions, 3)
        self.assertLess(state.ease_factor, ef_before)

    def test_invalid_rating_raises(self):
        with self.assertRaises(ValueError):
            review_card(99, new_card())


if __name__ == "__main__":
    unittest.main()