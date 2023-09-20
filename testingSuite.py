print()
print("TESTING SUITE")
print("-------------------------")

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

totalTests = 0
failedTests = 0

for funk in ndtests:
	print(f"#### {funk} ####")
	print("\u001b[1mEval\t(Result\tExpected)\u001b[0m")
	
	for ndt in ndtests[funk]:
		ndparts = ndt[:]
		ndoutcome = ndparts.pop()
		try:
			res = "\u001b[42mPASS\u001b[0m"
			if globals()[funk](*ndparts) != ndoutcome:
				failedTests += 1
				res = "\u001b[41mFAIL\u001b[0m"

			totalTests += 1
			print(f'{res}\t({globals()[funk](*ndparts)}\t{ndoutcome})')
		except BaseException as e:
			print('Failed: ' + str(e))
	print("")

print(f'Failed {failedTests} of {totalTests}')
print("-------------------------")