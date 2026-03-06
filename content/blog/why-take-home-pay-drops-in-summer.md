---
title: "Why Your Take-Home Pay Drops in Summer (Even Though Nothing Changed)"
slug: "why-take-home-pay-drops-in-summer"
excerpt: "Your paycheck shrinks every June like clockwork — same salary, same deductions, smaller check. The reason involves a quirk of how payroll systems think about time."
date: "2026-03-06"
---

Every summer, usually right around late May or early June, people notice their paycheck got smaller. Not by a lot — maybe twenty or thirty bucks, sometimes fifty — but enough to notice when you're looking at your bank account and doing the mental math you do every payday. Same job, same salary, same health insurance premium, same 401(k) contribution. But the net deposit is less than it was in April.

The first instinct is to assume you did something wrong, or your employer did. You check the pay stub looking for a new deduction, a typo, evidence of wage theft. You find nothing. Everything looks identical to the previous month except for one line: Social Security tax. That number is lower. Which sounds like it should mean *more* money in your pocket, not less. But somehow, you're taking home less anyway.

This is not a mistake. This is how payroll systems handle the Social Security wage base limit, and it happens to millions of people every year at slightly different times depending on how much they make and how often they get paid. The weird part is that it feels backwards — you'd think hitting the Social Security limit would mean a *raise*, not a pay cut. And for some people it does. But for a lot of people, especially those making between about $70,000 and $180,000, it creates this counterintuitive summer paycheck sag that nobody warned you about and that doesn't quite make sense until you understand what's actually happening.

## The Social Security Cap Is a Ceiling, Not a Floor

Social Security tax is 6.2% of your wages, up to a maximum amount of earnings per year. In 2026, that maximum is $176,100. (It goes up most years based on inflation — it was $168,600 in 2025, $160,200 in 2024, and so on.) Once your year-to-date earnings hit that number, you stop paying Social Security tax for the rest of the year. Medicare tax, which is 1.45% with no cap, keeps getting deducted forever. But Social Security stops.

If you make, say, $200,000 a year, this is straightforward good news. Somewhere around late October or early November, depending on your pay schedule, you'll have earned $176,100 for the year, Social Security tax will stop coming out, and your paycheck will be 6.2% bigger until December 31st. A nice little year-end bonus that happens automatically.

But if you make $90,000 a year, you never hit the cap. You pay Social Security tax on every paycheck, all year long, forever. No summer surprise, no autumn windfall, just the same deductions in the same amounts every single pay period.

The problem — the thing that creates the summer paycheck drop — happens to people in between. People who make enough to hit the Social Security cap eventually, but not so much that they hit it late in the year when it feels like a clean bonus. People who hit it in June or July or August, when it doesn't feel like anything except a confusing disruption to the paycheck rhythm you'd gotten used to.

Let's say you make $140,000 a year. You're well over the cap, so you know you'll stop paying Social Security tax at some point. If you're paid biweekly — 26 paychecks a year — each gross paycheck is about $5,385. Social Security tax takes out $334 per check. You hit the $176,100 cap after your 33rd paycheck of the year, which lands somewhere in mid-August. From that point forward, you stop paying Social Security tax and your take-home goes up by $334 every two weeks.

Except... wait. You only get 26 paychecks per year. There is no 33rd paycheck. The math doesn't work.

And that's where payroll systems start doing something weird.

## Payroll Software Doesn't Know What Year It Is

Here's the thing about most payroll systems: they don't prorate Social Security tax based on an annual salary and a calendar year. They calculate it per paycheck based on your year-to-date earnings *as of that paycheck*. Which sounds like the same thing but absolutely is not.

When you get paid biweekly, your employer's payroll system looks at your gross pay for that period — let's say $5,385 — and calculates 6.2% of that ($334) for Social Security. Then it checks your year-to-date earnings. If you're under the $176,100 cap, it deducts the $334. If you're over, it deducts nothing, or only the amount needed to get you exactly to the cap.

This works fine if your earnings are smooth and predictable. But a lot of things make earnings *not* smooth. Bonuses are the big one. If you get a $20,000 bonus in March, your year-to-date earnings jump by $20,000 in a single pay period. Suddenly you're way closer to the Social Security cap than you would be if you were just earning your base salary in even increments. And if that bonus pushes you over the threshold earlier in the year, you stop paying Social Security tax earlier — which means your paychecks for the rest of the year are bigger.

Except they're not bigger compared to your *previous* paychecks. They're bigger compared to what they *would have been* if you hadn't gotten the bonus. Because the bonus itself got taxed at a higher effective rate (bonuses are usually withheld at a flat supplemental rate of 22% for federal income tax, plus the full Social Security and Medicare), so the paycheck that included the bonus was enormous in gross terms but maybe not that much bigger in net terms. Then your next regular paycheck comes, and it's smaller than the one before the bonus, but bigger than it would have been without the bonus having pushed you over the Social Security cap.

Your brain does not process this well. Your brain sees: big paycheck in March (bonus), normal paycheck in April, smaller paycheck in June. It assumes something went wrong in June. It doesn't intuitively grasp that the June paycheck is only smaller relative to April because April still had Social Security tax and June doesn't — but June also doesn't have a bonus, and April did, so on net you're looking at a number that's lower even though one of your tax withholdings went *down*.

It's like if someone gave you a free coffee every morning for two months, then stopped, and you started paying for coffee again — except the coffee also got cheaper by fifty cents right when the free promotion ended. You're paying less than you used to, but more than you were paying when it was free, and your bank account just knows you're spending money on coffee again and it feels bad even though objectively you're saving fifty cents.

## The SalaryHog Calculator Knows This Is Annoying

When we built the take-home pay calculator at SalaryHog, one of the design questions was whether to show an annual average or a per-paycheck breakdown. We went with annual, partly because it's cleaner, but mostly because the per-paycheck view would require explaining this exact phenomenon — that your paycheck in July might be different from your paycheck in November even if nothing about your salary or elections changed, purely because of how Social Security tax works.

You can see it if you play with the numbers. Plug in a $140,000 salary with a $20,000 Q1 bonus. Your effective take-home per paycheck will be higher in the back half of the year than the front half, assuming biweekly pay, because you'll hit the Social Security cap earlier. But the month right *after* you hit it will feel like a dip, because you're comparing it to a period when you were getting both your regular pay and the lingering psychological boost of the bonus months.

The fix, if you want to call it that, is to think in annual terms. Your total take-home for the year is unaffected by *when* you hit the Social Security cap — you pay the same total amount of Social Security tax whether you hit it in May or October. The timing just shifts when that tax stops coming out, which shifts the per-paycheck amount, which creates these weird little seasonal fluctuations that feel like something's wrong when really it's just the payroll system doing exactly what it's supposed to do.

But we don't think in annual terms. We think in paycheck terms, and rent terms, and credit card statement terms. We notice when the deposit is forty dollars less than last time, and we check the pay stub, and we see that Social Security was lower, and we think "wait, that should be good," and then we get confused and annoyed and sometimes we send a testy email to HR asking what happened.

What happened is summer. And math. And the fact that your paycheck is a second-derivative artifact of a bunch of rules that were designed independently and happen to interact in ways that nobody thought to warn you about. The Social Security wage base cap is a real thing with a real purpose — it limits both how much you pay in and how much you can get out in benefits. The way payroll systems calculate withholding per pay period is practical and necessary. The fact that bonuses bunch up earnings in certain months is just how compensation works.

Put them all together and you get this thing where your paycheck does a little dip in early summer, for no reason you can see, and the explanation involves walking through three or four different systems that don't know about each other and don't care. Your raise didn't get rescinded. You didn't get demoted. Nothing broke. You just hit an invisible threshold at a time of year when it feels like a bug instead of a feature, and there's no good way to make that feel intuitive because it genuinely isn't.
