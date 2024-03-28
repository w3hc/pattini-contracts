const {
    loadFixture
} = require("@nomicfoundation/hardhat-toolbox/network-helpers")
const { expect } = require("chai")
const { ethers } = require("hardhat")

describe("Pattini", function () {
    async function deployContracts() {
        const [alice, bob] = await ethers.getSigners()

        const initialOwner = alice.address

        const repositoryName = "github-action-test"
        const OP = await ethers.getContractFactory("OP")
        const op = await OP.deploy()
        const tokenAddress = await op.getAddress()

        const funderAddress = alice.address
        const Pattini = await ethers.getContractFactory("Pattini")
        const pattini = await Pattini.deploy(
            initialOwner,
            repositoryName,
            tokenAddress,
            funderAddress
        )
        await op.transfer(await pattini.getAddress(), ethers.parseEther("200"))
        await op.approve(await pattini.getAddress(), ethers.parseEther("200"))

        return {
            pattini,
            alice,
            bob,
            repositoryName,
            funderAddress,
            tokenAddress,
            op
        }
    }

    describe("Deployment", function () {
        it("Should return the right token address", async function () {
            const { pattini, tokenAddress, op } = await loadFixture(
                deployContracts
            )
            expect(await op.balanceOf(await pattini.getAddress())).to.be.equal(
                ethers.parseEther("200")
            )
            expect(await pattini.tokenAddress()).to.equal(tokenAddress)
        })
    })

    describe("Interactions", function () {
        it("Should take an issue", async function () {
            const { pattini, bob } = await loadFixture(deployContracts)
            await pattini.take(88888, 42, bob.address)
            expect((await pattini.getIssue(88888))[1]).to.be.equal(42)
        })

        it("Should pay a contributor", async function () {
            const { pattini, bob, op } = await loadFixture(deployContracts)

            await pattini.take(88888, 42, bob.address)
            expect((await pattini.getIssue(88888))[1]).to.be.equal(42)

            expect(await op.balanceOf(bob.address)).to.be.equal(
                ethers.parseEther("0")
            )
            await pattini.pay(88888, 83)
            expect(await op.balanceOf(bob.address)).to.be.equal(
                ethers.parseEther("42")
            )
        })

        it("Should not take the issue", async function () {
            const { pattini, bob, op } = await loadFixture(deployContracts)

            await pattini.take(88888, 42, bob.address)
            expect((await pattini.getIssue(88888))[1]).to.be.equal(42)

            expect(await op.balanceOf(bob.address)).to.be.equal(
                ethers.parseEther("0")
            )
            await pattini.pay(88888, 83)
            expect(await op.balanceOf(bob.address)).to.be.equal(
                ethers.parseEther("42")
            )

            await expect(
                pattini.take(88888, 42, bob.address)
            ).to.be.revertedWith("Issue already paid")

            expect(await pattini.take(55555, 42, bob.address)).to.emit()
        })

        it("Should flush", async function () {
            const { pattini, bob, op } = await loadFixture(deployContracts)

            await pattini.take(88888, 42, bob.address)
            expect((await pattini.getIssue(88888))[1]).to.be.equal(42)

            expect(await op.balanceOf(await pattini.getAddress())).to.be.equal(
                ethers.parseEther("200")
            )
            await pattini.take(55555, 58, bob.address)

            await pattini.flush()

            expect(await op.balanceOf(await pattini.getAddress())).to.be.equal(
                ethers.parseEther("100")
            )
        })

        it("Should handle multiple entry for the same issue", async function () {
            const { pattini, bob, op } = await loadFixture(deployContracts)
            await pattini.take(88888, 10, bob.address)
            expect((await pattini.getIssue(88888))[1]).to.be.equal(10)
            expect(await op.balanceOf(await pattini.getAddress())).to.be.equal(
                ethers.parseEther("200")
            )
            await pattini.take(88888, 10, bob.address)
            await pattini.flush()
            expect(await op.balanceOf(await pattini.getAddress())).to.be.equal(
                ethers.parseEther("200")
            )
        })
    })
})
