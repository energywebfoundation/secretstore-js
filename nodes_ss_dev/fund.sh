
# fund with 10 ethers
amount="0x8AC7230489E80000"
for var in "$@"
do
    curl --data "{\"jsonrpc\":\"2.0\",\"method\":\"personal_sendTransaction\",\"params\":[{\"from\":\"0x00a329c0648769A73afAc7F9381E08FB43dBEA72\",\"to\":\"$var\",\"value\":\"$amount\"}, \"\"],\"id\":0}" -H "Content-Type: application/json" -X POST localhost:8545
done
