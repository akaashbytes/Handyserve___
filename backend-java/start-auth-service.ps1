$jar = "R:\PROJECT\FSJ\handyservy_pro\handyservy_pro\handyservy_pro\handyservy_pro\backend-java\auth-service\target\auth-service-1.0.0.jar"
$log = "R:\PROJECT\FSJ\handyservy_pro\handyservy_pro\handyservy_pro\handyservy_pro\backend-java\auth-service_app.log"
java -Xms24m -Xmx96m -XX:MaxMetaspaceSize=128m -Xshare:off -jar $jar 2>&1 | Tee-Object -FilePath $log
