# Water problem
ndtests = {
	"valid_meter_reading": [
		['999999999',True], 
		['000000000',True], 
		['99999999b',False], 
		['99999999.',False], 
		['a99999999',False], 
		['999a99999',False],
		['99999999',False], 
		['9999999999',False], 
	],
	"water_used": [
		['000001000', '000002005', 100.5], 
		['100000000', '200000000', 10000000.0],
		['999999995', '000000005', 1.0]
	],
	"compute_bill_amount": [
		['r', 100.5, 5.05],
		['c', 10000000.0, 2500.0]
	]
}

# Lab 4
ndtests = {
	"max_of_three": [
		[1,2,3,3], 
		[2,5,2,5],
		[10,10,10,10]
	],
	"digit_sum": [
		[1234, 10], 
		[5, 5],
		[0, 0]
	],
	"digit_divisible": [
		[824, True],
		[721, False],
		[1023, False]
	],
	"letter_streak": [
		['abccba', 'a', 1],
		['abcaaabbbbaa', 'a', 3],
		['aaaaa', 'a', 5],
		['abcabc', 'x', 0]
	],
	'pyramid_print': [
		[4, '*', True, None],
		[5, 'I', False, None]
	]
}

# Lab 4 SP2023
ndtests = {
	"max_of_three": [
		[1,2,3,3], 
		[2,5,2,5],
		[10,10,10,10]
	],
	"digit_sum": [
		[1234, 10], 
		[5, 5],
		[0, 0]
	],
	"digit_divisible": [
		[824, True],
		[721, False],
		[1023, False]
	],
	"letter_streak": [
		['abccba', 'a', 1],
		['abcaaabbbbaa', 'a', 3],
		['aaaaa', 'a', 5],
		['abcabc', 'x', 0]
	],
	'string_to_float': [
		["1234", 1234],
		["-20", -20],
		["17.89", 17.89],
		["+2.456", 2.456]
	]
}

# Lab 5
ndtests = {
	"is_divisible": [
		[4,2,True], 
		[7,3,False],
		[5,0,False]
	],
	"is_leap_year": [
		[1884, True], 
		[1900, False],
		[2000, True]
	],
	"days_in_month": [
		[4, 2012, 30],
		[2, 2012, 29]
	],
	"day_number": [
		[1, 20, 1999, 20],
		[8, 30, 2000, 243]
	],
	"days_between":[
		[4, 2, 1988, 8, 20, 1988, 140],
		[2, 21, 2000, 1, 12, 2017, 6170],
		[5, 17, 2003, 2, 20, 2004, 279],
	]
}

# Lab 8
ndtests = {
	"insert_middle": [
		["aacc", "bb", "aabbcc"], 
		["catbird", "dog", "catdogbird"]
	],
	"vowelless_streak": [
		["mississippi", 2], 
		["oar", 1],
		["baaabba", 2]
	],
	"finder": [
		["blahblah", "ah", 0, 8, 2],
		["blahblah", "ah", 5, 8, 6],
		["blahblah", "x", 0, 5, -1]
	],
	"slice_out": [
		["catdogbird", "dog", "catbird"],
		["mississippi", "ss", "miiippi"],
		["tick tock", "clock", "tick tock"]
	],
	"fancy_slice_out": [
		["catdogbird", "d*g", "catbird"],
		["bootblurtbuntband","b**t","blurtband"]
	]
}

# Lab 9
ndtests = {
	"even_vs_odd": [
		[[4, 11, 3, 8], True], 
		[[4, 11, 3], False],
		[[2,2,2,2,1,1,1,1], True],
		[[1], False]
	],
	"symmetrical_list": [
		[[4, 11, 8, 11, 4], True], 
		[["cat", "dog", "frog", "cat"], False]
	],
	"is_palindrome": [
		["racecar", True],
		["palindrome", False],
		['never odd or even', True]
	],
	"generate_user": [
		["Caroline Johnson", "cjohns"],
		["Fred Doe", "fdoe"]
	],
	"generate_users": [
		[["Jones, Claire", "Brown, Bill", "Harris, Jane"], ["cjones", "bbrown", "jharri"]],
		[["Baker, Jack", "Clark, Alyssa", "Baker, Jill"], ["jbaker", "aclark", "jbaker1"]]
	],
	"list_merger": [
		[[2,4,6], [3,5,7], [2,3,4,5,6,7]],
		[[1,2,9], [2,5], [1,2,2,5,9]]
	]
}

# Lab 11
ndtests = {
	"count_words": [
		['testfile.txt', {'this': 2, 'is': 1, 'a': 4, 'very': 1, 'simple': 1, 'file': 2, 'needs': 1, 'friend': 2, 'like': 2, 'robot': 2, 'walle': 1, 'or': 1, 'his': 1, 'evee': 1}]
	],
	"meldict": [
		[{ 'a':1, 'b':2 }, {'a':1, 'c':3}, {'a':[1,1], 'b':[2], 'c':[3] }]
	],
	"menu_inverter": [
		[{'tofurky':[3], 'berries':[3,4], 'bread':[3,2], 'greens':[1], 'cheese':[2,1], 'rice':[3], 'onions':[2],'broth':[2],'sauce/dressing ':[1,3]},{1: ['greens', 'sauce/dressing', 'cheese'],2: ['bread ', 'cheese ', 'broth ', 'onions '],3: ['sauce/dressing ', 'berries ', 'tofurky ', 'rice ', 'bread '], 4: ['berries ']}],
	]
}