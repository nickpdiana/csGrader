
print("TESTING SUITE")
print("-------------------------")

dictionary = {'tofurky':[3], 'berries':[3,4], 'bread':[3,2],'greens':[1], 'cheese':[2,1], 'rice':[3],'onions':[2],'broth':[2],'sauce/dressing':[1,3]}

ndfunc = "meldict"
ndtests = [
[dictionary, 1]
]

for ndt in ndtests:
	ndparts = ndt[:]
	ndoutcome = ndparts.pop()
	print(globals()[ndfunc](*ndparts) == ndoutcome, globals()[ndfunc](*ndparts), ndoutcome)
print("-------------------------")
